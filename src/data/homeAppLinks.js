import ArchGraphicIcon from '@/components/icons/ArchGraphicIcon.vue';
import DijkstraIcon from '@/components/icons/DijkstraIcon.vue';
import JungsanIcon from '@/components/icons/JungsanIcon.vue';
import PasswordIcon from '@/components/icons/PasswordIcon.vue';
import SurveysIcon from '@/components/icons/SurveysIcon.vue';
import ClipboardImgSaveIcon from '@/components/icons/ClipboardImgSaveIcon.vue';
import PdfToPngIcon from '@/components/icons/PdfToPngIcon.vue';
import TodoIcon from '@/components/icons/TodoIcon.vue';
import WBSChartIcon from '@/components/icons/WBSChartIcon.vue';
import ChattingAppIcon from '@/components/icons/ChattingAppIcon.vue';
import WebRTCVideoIcon from '@/components/icons/WebRTCVideoIcon.vue';
import HTML2MDIcon from '@/components/icons/HTML2MDIcon.vue';
import QrCodeScannerIcon from '@/components/icons/QrCodeScannerIcon.vue';
import ExamPaperIcon from '@/components/icons/ExamPaperIcon.vue';
import S3HaimIcon from '@/components/icons/S3HaimIcon.vue';
import WebDavViewerIcon from '@/components/icons/WebDavViewerIcon.vue';
import FocusTimerIcon from '@/components/icons/FocusTimerIcon.vue';
import HearapyWebIcon from '@/components/icons/HearapyWebIcon.vue';
import PromptBookIcon from '@/components/icons/PromptBookIcon.vue';
import DailyTimelineIcon from '@/components/icons/DailyTimelineIcon.vue';
import PdfToSvgIcon from '@/components/icons/PdfToSvgIcon.vue';

/**
 * 홈 화면에 표시할 앱 카드 메타데이터.
 * 내부/외부 구분은 코드에서 router·SPA 경로 집합으로 자동 처리합니다.
 */
export const HOME_APP_LINKS = [
  { href: '/arch-graphic', icon: ArchGraphicIcon, title: '건설 그래픽 커뮤니케이션', description: '건설 그래픽 커뮤니케이션 단어 외우기' },
  { href: '/dijkstra', icon: DijkstraIcon, title: '다익스트라 알고리즘', description: '다익스트라 알고리즘 테스트' },
  { href: '/jungsan', icon: JungsanIcon, title: '회식 정산 계산기', description: '테이블별 회식비 정산' },
  { href: '/password', icon: PasswordIcon, title: '강력한 비밀번호 생성기', description: '안전한 비밀번호 생성' },
  { href: '/surveys', icon: SurveysIcon, title: '검사 모음', description: '각종 검사 모음' },
  { href: '/clipboard-img-save', icon: ClipboardImgSaveIcon, title: '클립보드 이미지 저장기', description: '클립보드 이미지를 PNG/WEBP로 저장' },
  { href: '/pdf-to-png', icon: PdfToPngIcon, title: 'PDF to PNG', description: 'PDF를 고화질 PNG 이미지로 변환' },
  {
    href: '/todo',
    icon: TodoIcon,
    title: '할 일 관리',
    description: '할 일 목록 관리 및 체크리스트 <br/> Fast TODO List',
    descriptionHtml: true,
  },
  { href: '/wbs-chart', icon: WBSChartIcon, title: 'WBS 차트 편집기', description: '프로젝트 구조를 시각적으로 계획하고 편집하세요.' },
  { href: '/chatting-app', icon: ChattingAppIcon, title: 'WebRTC 채팅', description: 'QR코드로 연결하는 퀴즈용 P2P 실시간채팅' },
  { href: '/web-rtc-video', icon: WebRTCVideoIcon, title: 'WebRTC 비디오', description: 'WebRTC 비디오 통화 테스트' },
  { href: '/html-to-md', icon: HTML2MDIcon, title: 'HTML to MD', description: 'HTML을 MD로 변환' },

  { href: 'https://qrscan101.onrender.com/', icon: QrCodeScannerIcon, title: 'QR Scanner', description: 'QR 코드 스캐너 / 클립보드 qr코드 인식' },
  { href: '/test-paper/', icon: ExamPaperIcon, title: 'Exam Master', description: '시험 응시 및 채점 도우미' },
  { href: '/s3haim', icon: S3HaimIcon, title: 'S3 Haim', description: 'S3 활용 Note Taking App' },
  { href: '/webdav-viewer', icon: WebDavViewerIcon, title: 'WebDAV Viewer', description: 'WebDAV Viewer App' },
  { href: 'https://focus-timer.jaehyung101.biz/', icon: FocusTimerIcon, title: 'Focus Timer', description: '타이머 앱' },
  { href: '/hearapy-web', icon: HearapyWebIcon, title: 'Hearapy Web', description: 'Hearapy Web' },
  { href: '/prompt-book', icon: PromptBookIcon, title: 'Prompt Book', description: 'NotebookLM 용 프롬프트 템플릿 저장소' },
  { href: '/daily-timeline', icon: DailyTimelineIcon, title: 'Daily Timeline', description: '일정 Gantt 차트 간단 관리' },
  { href: '/pdf-to-svg/', icon: PdfToSvgIcon, title: 'PDF to SVG', description: 'PDF를 SVG로 변환' },
];
