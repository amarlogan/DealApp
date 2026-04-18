-- ─────────────────────────────────────────────────────────────────────────────
-- DealNexus: Comment Count Synchronization
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add comment_count column to deals
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- 2. Create trigger function to sync comment count
CREATE OR REPLACE FUNCTION fn_sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE deals SET comment_count = comment_count + 1 WHERE id = NEW.deal_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE deals SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.deal_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create triggers
DROP TRIGGER IF EXISTS trg_sync_comment_count_insert ON comments;
CREATE TRIGGER trg_sync_comment_count_insert
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION fn_sync_comment_count();

DROP TRIGGER IF EXISTS trg_sync_comment_count_delete ON comments;
CREATE TRIGGER trg_sync_comment_count_delete
AFTER DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION fn_sync_comment_count();

-- 4. Initial sync for existing comments
UPDATE deals d
SET comment_count = (SELECT COUNT(*) FROM comments c WHERE c.deal_id = d.id);
