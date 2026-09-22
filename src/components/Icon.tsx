import React from 'react';
import {
  AwardIcon,
  BellIcon,
  BookOpenIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  CopyIcon,
  EyeIcon,
  FileTextIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  GripVerticalIcon,
  HomeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LinkIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  MoreHorizontalIcon,
  MoonIcon,
  PauseIcon,
  PencilIcon,
  PlusIcon,
  PlayIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SunIcon,
  Trash2Icon,
  UploadIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
  XIcon } from
'lucide-react';

export type IconName =
'home' |
'book' |
'video' |
'pen' |
'award' |
'bell' |
'sun' |
'moon' |
'play' |
'pause' |
'bookmark' |
'check' |
'x' |
'lock' |
'chart' |
'upload' |
'back' |
'users' |
'inbox' |
'user' |
'settings' |
'logout' |
'plus' |
'search' |
'mail' |
'shield' |
'eye' |
'save' |
'trash' |
'copy' |
'more' |
'grip' |
'file' |
'link' |
'folder' |
'graduate' |
'help' |
'next';

const MAP: Record<IconName, React.ComponentType<{className?: string;}>> = {
  home: HomeIcon,
  book: BookOpenIcon,
  video: VideoIcon,
  pen: PencilIcon,
  award: AwardIcon,
  bell: BellIcon,
  sun: SunIcon,
  moon: MoonIcon,
  play: PlayIcon,
  pause: PauseIcon,
  bookmark: BookmarkIcon,
  check: CheckIcon,
  x: XIcon,
  lock: LockIcon,
  chart: LayoutDashboardIcon,
  upload: UploadIcon,
  back: ChevronLeftIcon,
  users: UsersIcon,
  inbox: InboxIcon,
  user: UserIcon,
  settings: SettingsIcon,
  logout: LogOutIcon,
  plus: PlusIcon,
  search: SearchIcon,
  mail: MailIcon,
  shield: ShieldCheckIcon,
  eye: EyeIcon,
  save: SaveIcon,
  trash: Trash2Icon,
  copy: CopyIcon,
  more: MoreHorizontalIcon,
  grip: GripVerticalIcon,
  file: FileTextIcon,
  link: LinkIcon,
  folder: FolderOpenIcon,
  graduate: GraduationCapIcon,
  help: CircleHelpIcon,
  next: ChevronRightIcon
};

interface IconProps {
  name: IconName;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, className = '', filled = false }: IconProps) {
  const Cmp = MAP[name];
  const appearance = filled
    ? 'fill-current stroke-none'
    : 'fill-none stroke-current stroke-[1.8]';
  const size = className.includes('size-') ? '' : ' size-5';

  return <Cmp className={`i shrink-0 ${appearance}${size}${className ? ` ${className}` : ''}`} />;
}
