// Advanced Features Components
// Feature 34: Voice commands, AR, chatbot, and video conferencing

// AR Integration
export {
  ARProvider,
  useAR,
  ARViewer,
  MaintenanceGuideList,
  StepByStepGuide,
} from './ARIntegration';

export type {
  ARMarker,
  ARAnnotation,
  ARStep,
  MaintenanceGuide,
  ARState,
  ARProviderProps,
  ARViewerProps,
  MaintenanceGuideListProps,
  StepByStepGuideProps,
} from './ARIntegration';

// Chatbot Assistant
export {
  DEFAULT_INTENTS,
  ChatbotProvider,
  useChatbot,
  ChatWidget,
  InlineChat,
} from './ChatbotAssistant';

export type {
  MessageRole,
  MessageStatus,
  ChatMessage,
  ChatAction,
  QuickReply,
  ChatbotConfig,
  ChatbotState,
  Intent,
  ChatContext,
  ChatbotProviderProps,
  ChatWidgetProps,
  InlineChatProps,
} from './ChatbotAssistant';

// Video Conferencing
export {
  VideoConferenceProvider,
  useVideoConference,
  VideoGrid,
  VideoTile,
  MeetingControls,
  MeetingChat,
  JoinMeetingDialog,
} from './VideoConferencing';

export type {
  Participant,
  MeetingInfo,
  CallState,
  VideoConferenceProviderProps,
  VideoGridProps,
  VideoTileProps,
  MeetingControlsProps,
  MeetingChatProps,
  JoinMeetingDialogProps,
} from './VideoConferencing';

// Re-export ChatMessage as VideoMessage for backwards compatibility
export { type ChatMessage as VideoMessage } from './VideoConferencing';
