'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageToolbar, ConfirmDialog } from '@/components/ui';
import { CollaborativeTimeline } from '@/components/crm';
import type { TimelineActivity } from '@/components/crm';
import { CommentModal, type Comment } from '@/components/modals';
import { ArrowLeft } from 'lucide-react';
import { crmService } from '@/services/crm.service';

const normalizeType = (t: string): TimelineActivity['type'] => {
  const v = (t ?? '').toLowerCase();
  if (
    v === 'email' ||
    v === 'call' ||
    v === 'meeting' ||
    v === 'note' ||
    v === 'task' ||
    v === 'status_change' ||
    v === 'assignment' ||
    v === 'document' ||
    v === 'video_call'
  ) {
    return v;
  }
  return 'note';
};

const mapActivity = (a: any): TimelineActivity => ({
  id: String(a?.id ?? ''),
  type: normalizeType(a?.type),
  title: a?.subject ?? '',
  description: a?.description ?? '',
  timestamp: a?.createdAt ?? a?.dueDate ?? a?.startDate ?? '',
  user: {
    id: String(a?.assignedToId ?? ''),
    name: a?.assignedToName ?? '',
  },
});

export default function ActivityTimelinePage() {
  const router = useRouter();
  const [timelineActivities, setTimelineActivities] = useState<TimelineActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await crmService.activityRecords.getAll()) as any[];
      const list = Array.isArray(raw) ? raw : [];
      setTimelineActivities(list.map(mapActivity));
    } catch (err) {
      setLoadError('Failed to load activity timeline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  const handleAddComment = (activityId: string, comment: string, mentions: string[]) => {
    setCurrentActivityId(activityId);
    setShowCommentModal(true);
  };

  const handleSaveComment = async (comment: Comment) => {
    if (!currentActivityId) {
      setShowCommentModal(false);
      return;
    }
    setActionError(null);
    try {
      // No dedicated comment sub-resource exists; persist the comment as a
      // linked "note" activity record that references the parent activity.
      await crmService.activityRecords.create({
        type: 'note',
        subject: 'Comment',
        description: comment.content,
        relatedTo: currentActivityId,
        relatedType: 'activity',
        tags: comment.mentions,
      });
      setShowCommentModal(false);
      setCurrentActivityId(undefined);
      await load();
    } catch (err) {
      setActionError('Failed to save comment. Please try again.');
    }
  };

  // Likes have no backend field/endpoint yet — see NEEDS BACKEND.
  const handleLikeActivity = (activityId: string) => {
    setActionError('Liking activities is not yet supported by the backend.');
  };

  const handleEditActivity = (activityId: string) => {
    // No inline edit form on this page; route to the activity record editor.
    router.push(`/crm/activities/${activityId}/edit`);
  };

  const handleDeleteActivity = (activityId: string) => {
    setDeleteTarget({ type: 'activity', id: activityId });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    try {
      await crmService.activityRecords.delete(id);
      setTimelineActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setLoadError('Failed to delete activity. Please try again.');
    } finally {
      setDeleteTarget(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">

      <div className="flex-1 px-3 py-2 overflow-auto">
        <button
          onClick={() => router.push('/crm/advanced-features')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Advanced Features
        </button>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {actionError && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Collaborative Activity Timeline</h2>
          <p className="text-gray-600 mb-2">
            Complete interaction history with comments, likes, @mentions, and attachments for full team
            collaboration.
          </p>
          <CollaborativeTimeline
            activities={timelineActivities}
            currentUser={{ id: '2', name: 'Mike Chen' }}
            teamMembers={[
              { id: '1', name: 'Sarah Johnson', role: 'Account Executive' },
              { id: '2', name: 'Mike Chen', role: 'Sales Manager' },
              { id: '3', name: 'David Park', role: 'Solutions Engineer' },
            ]}
            onAddComment={handleAddComment}
            onLike={handleLikeActivity}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
            showComments={true}
            showActions={true}
          />
        </div>
      </div>

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setCurrentActivityId(undefined);
        }}
        onSave={handleSaveComment}
        mode="add"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this ${deleteTarget?.type}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
