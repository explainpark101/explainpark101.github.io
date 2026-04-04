/**
 * 홈 화면에 표시할 앱 카드 메타데이터 (아이콘은 Home.vue의 iconMap과 iconKey로 연결).
 * 내부/외부 구분은 코드에서 router·SPA 경로 집합으로 자동 처리합니다.
 */
export const HOME_APP_LINKS = [
  { href: '/arch-graphic', iconKey: 'archGraphic', title: '건설 그래픽 커뮤니케이션', description: '건설 그래픽 커뮤니케이션 단어 외우기' },
  { href: '/dijkstra', iconKey: 'dijkstra', title: '다익스트라 알고리즘', description: '다익스트라 알고리즘 테스트' },
  { href: '/jungsan', iconKey: 'jungsan', title: '회식 정산 계산기', description: '테이블별 회식비 정산' },
  { href: '/password', iconKey: 'password', title: '강력한 비밀번호 생성기', description: '안전한 비밀번호 생성' },
  { href: '/surveys', iconKey: 'surveys', title: '검사 모음', description: '각종 검사 모음' },
  { href: '/clipboard-img-save', iconKey: 'clipboardImgSave', title: '클립보드 이미지 저장기', description: '클립보드 이미지를 PNG/WEBP로 저장' },
  { href: '/pdf-to-png', iconKey: 'pdfToPng', title: 'PDF to PNG', description: 'PDF를 고화질 PNG 이미지로 변환' },
  {
    href: '/todo',
    iconKey: 'todo',
    title: '할 일 관리',
    description: '할 일 목록 관리 및 체크리스트 <br/> Fast TODO List',
    descriptionHtml: true,
  },
  { href: '/wbs-chart', iconKey: 'wbsChart', title: 'WBS 차트 편집기', description: '프로젝트 구조를 시각적으로 계획하고 편집하세요.' },
  { href: '/chatting-app', iconKey: 'chattingApp', title: 'WebRTC 채팅', description: 'QR코드로 연결하는 퀴즈용 P2P 실시간채팅' },
  { href: '/web-rtc-video', iconKey: 'webRtcVideo', title: 'WebRTC 비디오', description: 'WebRTC 비디오 통화 테스트' },
  { href: '/html-to-md', iconKey: 'htmlToMd', title: 'HTML to MD', description: 'HTML을 MD로 변환' },

  { href: 'https://qrscan101.onrender.com/', iconKey: 'qrScanner', title: 'QR Scanner', description: 'QR 코드 스캐너 / 클립보드 qr코드 인식' },
  { href: '/test-paper/', iconKey: 'examPaper', title: 'Exam Master', description: '시험 응시 및 채점 도우미' },
  { href: '/s3haim', iconKey: 's3haim', title: 'S3 Haim', description: 'S3 활용 Note Taking App' },
  { href: '/webdav-viewer', iconKey: 'webdavViewer', title: 'WebDAV Viewer', description: 'WebDAV Viewer App' },
  { href: 'https://focus-timer.jaehyung101.biz/', iconKey: 'focusTimer', title: 'Focus Timer', description: '타이머 앱' },
];
