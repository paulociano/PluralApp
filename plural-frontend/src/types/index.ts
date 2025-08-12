export type Role = 'USER' | 'ADMIN';

export type TopicCategory = 
  | 'TECNOLOGIA' 
  | 'SOCIEDADE' 
  | 'CULTURA' 
  | 'POLITICA' 
  | 'MEIO_AMBIENTE' 
  | 'CIENCIA' 
  | 'OUTRO';

export type UserProfile = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  bio: string | null;
  createdAt: string;
  points: number;
  role: Role;
  _count: {
    arguments: number;
    votes: number;
  };
  badges: UserBadge[];
  recentArguments: Argumento[];
  allBadges?: Badge[];
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  category: TopicCategory;
  _count: { arguments: number };
  participantCount?: number;
};

export type PendingTopic = {
  id: string;
  title: string;
  createdAt: string;
  createdBy: { name: string; username: string | null; };
};

export type Argumento = {
  id: string;
  content: string;
  referenceUrl?: string | null;
  createdAt: string;
  topic: { id: string; title: string; };
  author: { id: string; name: string; username: string | null };
  votesCount: number;
  replyCount: number;
  topicId: string;
  parentArgumentId: string | null;
  type: 'PRO' | 'CONTRA' | 'NEUTRO';
};

export type ArgumentoFavorito = {
  id: string;
  argument: Argumento;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type BadgeIconProps = {
iconName: string;
size?: number;
className?: string;
};

export type UserBadge = {
  id: string;
  badge: Badge;
};

export type Article = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorTitle: string | null;
  published: boolean;
  createdAt: string;
};

export type Report = {
  id: string;
  reason: string;
  notes: string | null;
  createdAt: string;
  reporter: { name: string; username: string | null };
  reportedArgument: { id: string; content: string; authorId: string };
};

// Renomeamos o tipo principal para corresponder ao que estamos importando
export type ProfileData = UserProfile;

export type Fallacy = { id: string; name: string; description: string };
export type Exercise = { id: string; text: string };
export type Feedback = { isCorrect: boolean; explanation: string };

export type Argument = {
  id: string;
  content: string;
  referenceUrl?: string | null;
  author: { id: string; name: string; username: string | null; };
  votesCount: number;
  replyCount: number;
  topicId: string;
  parentArgumentId: string | null;
  type: 'PRO' | 'CONTRA' | 'NEUTRO';
};

export type ArgumentPanelProps = {
  argument: Argument | null;
  onClose: () => void;
  onActionSuccess: () => void;
  onSelectArgument: (arg: Argument) => void;
};

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  articleToEdit: Article | null;
};

export type AvatarProps = {
  name: string;
  size?: number;
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type CategoryMenuBarProps = {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

export type ArgumentData = { id: string; content: string; author: { id: string; name: string; }; votesCount: number; replyCount: number; parentArgumentId: string | null; topicId: string; type: 'PRO' | 'CONTRA' | 'NEUTRO'; replies?: ArgumentData[] };
export type Node = d3.SimulationNodeDatum & { id: string; data: ArgumentData };
export type Link = { source: any; target: any };

export type DebateGraphProps = {
  argumentsTree: ArgumentData[];
  onNodeClick: (argument: ArgumentData) => void;
};

export type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: UserProfile;
};

export type FeaturedTopicCardProps = {
  topic: Topic;
};

export type EditorProps = {
  onChange: (html: string) => void;
  initialHtml?: string;
};

export type NewArgumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  topicId: string | null;
  onSuccess: () => void;
};

export type Notification = {
  id: string;
  isRead: boolean;
  createdAt: string;
  triggerUser: { name: string };
  originArgumentId: string;
  originArgument?: { topicId: string };
};

export type NotificationItemProps = {
  notification: Notification;
  onNotificationRead: (notificationId: string) => void;
  onItemClick: () => void; // Função para fechar o menu
};

export type ArgumentAnalysis = {
  clarity: { score: number; feedback: string };
  bias: { score: number; feedback: string };
  consistency: { score: number; feedback: string };
};

export type ReplyFormProps = {
  onSubmit: (content: string, type: 'PRO' | 'CONTRA' | 'NEUTRO', referenceUrl: string) => void;
  isSubmitting: boolean;
};

export type ReportArgumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  argumentId: string;
};

export type SearchBarProps = {
  onSearch: (query: string) => void;
  value: string;
};

export type TopicGridCardProps = {
  topic: Topic;
};

export type TrendingTopicsProps = {
  topics: Topic[];
};