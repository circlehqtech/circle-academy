export const heading = 'mb-2.5 text-lg font-[650] tracking-[-0.01em]';
export const muted = 'text-muted';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-[99px] px-5 py-[11px] font-[650] transition-[background,transform] duration-200 ease-hq active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:transform-none';
export const button = `${buttonBase} bg-accent text-white hover:bg-accent-press`;
export const buttonGhost = `${buttonBase} border border-line bg-transparent text-foreground hover:border-foreground`;
export const buttonSmall = `${button} px-3.5 py-[7px] text-sm [&_.i]:size-4`;
export const buttonGhostSmall = `${buttonGhost} px-3.5 py-[7px] text-sm [&_.i]:size-4`;
export const linkButton = 'text-[13.5px] font-semibold text-accent-text';

const responsiveTwoColumn = 'grid grid-cols-[minmax(0,1fr)] gap-9 min-[1021px]:gap-11';
export const homeGrid = `${responsiveTwoColumn} mt-10 min-[1021px]:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]`;
export const courseGrid = `${responsiveTwoColumn} min-[1021px]:grid-cols-[minmax(240px,340px)_minmax(0,1fr)]`;
export const liveGrid = `${responsiveTwoColumn} min-[1021px]:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)] min-[1021px]:gap-10`;
export const studyGrid = `${responsiveTwoColumn} min-[1021px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] min-[1021px]:gap-10`;
export const certificateGrid = `${responsiveTwoColumn} min-[1021px]:grid-cols-[minmax(230px,300px)_minmax(0,1fr)] min-[1021px]:gap-10`;
export const adminGrid = `${responsiveTwoColumn} min-[1021px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]`;

export const tiles = 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[22px]';
export const tile = 'flex flex-col overflow-hidden rounded-[22px_22px_14px_14px] border border-line bg-surface transition-transform duration-300 ease-hq hover:-translate-y-1';
export const art = 'relative flex h-[150px] items-end overflow-hidden px-[18px] py-4 text-[76px] leading-[0.75] font-extrabold tracking-[-0.05em] [font-stretch:80%]';
export const artTone: Record<string, string> = {
  a1: 'bg-hq-red text-white/32',
  a2: 'bg-hq-red-ink text-hq-bone/30',
  a3: 'bg-hq-amber text-hq-ink/40',
};
export const tileBody = 'px-[18px] pt-4 pb-5 text-left [&>b]:block [&>b]:text-[17px] [&>b]:leading-tight [&>b]:font-[650] [&>span:not(.progress-bar)]:my-1 [&>span:not(.progress-bar)]:mb-3.5 [&>span:not(.progress-bar)]:block [&>span:not(.progress-bar)]:text-sm [&>span:not(.progress-bar)]:text-muted';
export const tag = 'absolute top-3.5 right-3.5 rounded-[99px] bg-hq-ink px-3 py-[5px] text-[13px] leading-[1.3] font-[650] tracking-normal text-hq-amber [font-stretch:100%]';
export const progressBar = 'progress-bar h-1.5 overflow-hidden rounded-[99px] bg-surface-2 [&>i]:block [&>i]:h-full [&>i]:w-[calc(var(--p)*1%)] [&>i]:rounded-[99px] [&>i]:bg-accent [&>i]:transition-[width] [&>i]:duration-1000 [&>i]:ease-hq';

export const row = 'grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-none border-t border-line px-2.5 py-4 transition-colors duration-200 first:border-t-0 hover:bg-surface min-[821px]:grid-cols-[auto_minmax(0,1fr)_auto] [&_.secondary]:text-sm [&_.secondary]:text-muted [&_.row-action]:hidden min-[821px]:[&_.row-action]:inline-flex';
export const status = 'inline-flex items-center gap-2 text-sm font-semibold [&>i]:size-[9px] [&>i]:rounded-full [&>i]:bg-reward';
export const statusMiss = `${status} [&>i]:bg-accent`;
export const statusSoft = `${status} [&>i]:bg-muted`;
export const chip = 'inline-flex items-center gap-2 rounded-[99px] bg-surface-2 px-[13px] py-1.5 text-[13.5px] transition-transform duration-200 ease-hq hover:-translate-y-0.5 [&_.i]:size-3.5 [&_b]:text-accent-text [&_b]:[font-variant-numeric:tabular-nums]';
export const panel = 'rounded-[18px] bg-surface-2 px-6 py-[22px]';
export const infoList = 'grid grid-cols-[auto_1fr] gap-x-[22px] gap-y-1.5 [&_dt]:text-muted [&_dd]:font-semibold';
export const textarea = 'min-h-24 w-full resize-y rounded-2xl border-[1.5px] border-line bg-surface px-4 py-3.5 text-foreground transition-colors duration-200 outline-none focus:border-accent';
export const textInput = 'rounded-[14px] border-[1.5px] border-line bg-surface px-4 py-[13px] text-foreground transition-colors duration-200 outline-none focus:border-accent disabled:opacity-50';
export const selectInput = `${textInput} w-full appearance-none`;
export const fieldLabel = 'mb-1.5 block text-sm font-semibold';
export const card = 'rounded-[18px] border border-line bg-surface p-5';
export const tabs = 'flex gap-1.5 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
export const tabButton = '-mb-px shrink-0 border-b-2 border-transparent px-4 py-2.5 font-semibold text-muted transition-colors duration-200 aria-selected:border-accent aria-selected:text-foreground';
export const sectionIntro = 'mb-6 max-w-[68ch] text-muted';
export const tableWrap = 'overflow-x-auto rounded-[18px] border border-line bg-surface';
export const table = 'w-full min-w-[720px] border-collapse text-left [&_th]:border-b [&_th]:border-line [&_th]:px-4 [&_th]:py-3 [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-muted [&_td]:border-b [&_td]:border-line [&_td]:px-4 [&_td]:py-3.5 [&_tr:last-child_td]:border-b-0';
export const courseListButton = 'block w-full rounded-[14px] border-[1.5px] border-transparent px-4 py-3.5 transition-[background,border-color] duration-200 hover:bg-surface aria-pressed:border-foreground aria-pressed:bg-surface [&+button]:mt-1.5 [&>b]:block [&>b]:leading-tight [&>b]:font-[620] [&>span]:mt-1 [&>span]:flex [&>span]:items-center [&>span]:gap-1.5 [&>span]:text-[13.5px] [&>span]:text-muted [&>span_.i]:size-3.5';
export const agenda = '[&>li]:flex [&>li]:items-center [&>li]:justify-between [&>li]:gap-3.5 [&>li]:border-t [&>li]:border-line [&>li]:py-3.5 [&>li:first-child]:border-t-0 [&_b]:block [&_b]:font-[620] [&_span]:text-sm [&_span]:text-muted';
export const pin = 'mt-[26px] rounded-[16px_16px_16px_4px] bg-surface-2 px-5 py-[18px] [&>b]:mb-1 [&>b]:block';
