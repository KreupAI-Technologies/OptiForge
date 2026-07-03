'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageToolbar, ConfirmDialog } from '@/components/ui';
import { CollaborativeTimeline } from '@/components/crm';
import type { TimelineActivity } from '@/components/crm';
import { CommentModal, type Comment } from '@/components/modals';
import { ArrowLeft } from 'lucide-react';
import { crmService } from '@/services/crm.service';

export default function ActivityTimelinePage() {
  const router = useRouter();
  const [timelineActivities, setTimelineActivities] = useState<TimelineActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

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

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await crmService.activities.getAll()) as any[];
        const list = Array.isArray(raw) ? raw : [];
        const mapped: TimelineActivity[] = list.map((a) => ({
          id: String(a?.id ?? ''),
          type: normalizeType(a?.type),
          title: a?.subject ?? '',
          description: a?.description ?? '',
          timestamp: a?.createdAt ?? a?.dueDate ?? a?.startDate ?? '',
          user: {
            id: String(a?.assignedToId ?? ''),
            name: a?.assignedToName ?? '',
          },
        }));
        if (!cancelled) setTimelineActivities(mapped);
      } catch (err) {
        if (!cancelled) setLoadError('Failed to load activity timeline. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  const handleAddComment = (activityId: string, comment: string, mentions: string[]) => {
    setCurrentActivityId(activityId);
    setShowCommentModal(true);
  };

  const handleSaveComment = (comment: Comment) => {
    console.log('Comment saved:', comment);
    setShowCommentModal(false);
    setCurrentActivityId(undefined);
  };

  const handleLikeActivity = (activityId: string) => {
    console.log('Activity liked:', activityId);
  };

  const handleEditActivity = (activityId: string) => {
    console.log('Editing activity:', activityId);
  };

  const handleDeleteActivity = (activityId: string) => {
    setDeleteTarget({ type: 'activity', id: activityId });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      console.log('Deleted:', deleteTarget);
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
