# Discord Webhook 기반 데이터 동기화 시스템 (Skill Docs)

본 문서는 Discord Webhook을 활용하여 브라우저의 IndexedDB 및 LocalStorage 데이터를 클라우드(Discord 서버)에 백업하고, 여러 기기 간에 동기화하는 로직에 대해 설명합니다.

## 1. 개요

- **목적**: 별도의 백엔드 서버 없이 Discord Webhook을 데이터 저장소로 활용하여 사용자 설정 및 시청 기록을 보존.
- **핵심 기법**:

  - **Root Message Tracking**: 최신 백업 파일의 메시지 ID를 특정 '루트 메시지'에 기록하여 탐색 속도 최적화.
  - **Attachment Storage**: JSON 데이터를 파일 형태로 첨부하여 Discord 채널에 업로드.
  - **Beacon API**: 페이지 종료 시점(`unload`)에 안정적인 자동 백업 수행.

## 2. 주요 저장소 키 (Storage Keys)

- `anilife_webhook_url`: 사용자가 설정한 Discord Webhook 엔드포인트.
- `anilife_webhook_root_message_id`: 최신 백업의 ID를 담고 있는 관리용 메시지의 ID.

## 3. 핵심 로직 상세

### 3.1 루트 메시지 관리 (Root Message Management)

단순 Webhook은 메시지 목록 조회 API를 제공하지 않으므로, 최신 백업본을 찾기 위해 "이정표" 역할을 하는 메시지를 운용합니다.

- **최신 백업 ID 조회 (`getLatestBackupIdFromRoot`)**

  - 저장된 `ROOT_MESSAGE_ID`를 통해 Discord에서 해당 메시지 정보를 가져옵니다.
  - 메시지의 `content` 필드에 적힌 17~20자리 숫자가 바로 최신 백업 데이터의 메시지 ID입니다.
- **루트 메시지 갱신 (`updateRootMessageContent`)**

  - 백업이 완료되면 새로 생성된 백업 메시지의 ID를 `PATCH` 요청을 통해 루트 메시지의 `content`로 업데이트합니다.
  - 루트 메시지가 삭제된 상태(404)라면 새로 생성 후 ID를 저장합니다.

### 3.2 데이터 백업 프로세스 (`performWebhookBackup`)

- **데이터 취합**: LocalStorage의 설정 정보와 IndexedDB의 시청 기록 캐시를 하나의 JSON 객체로 병합합니다.
- **파일 생성**: JSON 문자열을 `File` 객체(Blob)로 변환합니다.
- **FormData 구성**:

  - `files[0]`: 백업 JSON 파일.
  - `payload_json`: 메시지 내용(타임스탬프, 발생 원인 등)을 포함한 메타데이터.
- **전송**: `POST` 요청을 통해 Discord Webhook으로 전송하고, 반환된 메시지 ID로 루트 메시지를 갱신합니다.

### 3.3 데이터 복구 프로세스 (`restoreFromWebhook`)

- **ID 획득**: 루트 메시지로부터 최신 백업 메시지 ID를 읽어옵니다.
- **첨부파일 URL 추출**: 해당 메시지 정보에서 `attachments[0].url`을 확보합니다.
- **데이터 다운로드**: 확보된 URL로 `fetch`를 수행하여 JSON 데이터를 가져옵니다.
- **병합/교체 (`processImportFile`)**:

  - **Merge 모드**: 기존 로컬 데이터와 백업 데이터를 병합 (중복 제거 포함).
  - **Replace 모드**: 로컬 데이터를 완전히 지우고 백업 데이터로 대체.

### 3.4 자동 백업 전략

- **이벤트 트리거**: 북마크 추가/삭제, 싫어요 설정, 비디오 진행도(50%, 95%) 달성 시 즉시 백업을 실행합니다.
- **Unload 백업**: `navigator.sendBeacon`을 사용하여 브라우저가 닫히는 순간에도 `FormData`를 Discord로 전송하여 데이터 손실을 방지합니다.

## 4. 관련 API 인터페이스 (Pseudo-code)

### 전송 및 수정

| 기능 | 메소드 | 엔드포인트 | 설명 |
| --- | --- | --- | --- |
| 백업 업로드 | `POST` | `${webhookUrl}?wait=true` | 파일 첨부 백업 수행 |
| 루트 갱신 | `PATCH` | `${webhookUrl}/messages/${rootId}` | 최신 백업 ID 기록 |
| 종료 시 백업 | `Beacon` | `${webhookUrl}` | 비동기식 마지막 백업 |

### 조회 및 다운로드

| 기능 | 메소드 | 엔드포인트 | 설명 |
| --- | --- | --- | --- |
| 메시지 조회 | `GET` | `${webhookUrl}/messages/${msgId}` | 메타데이터 및 첨부파일 URL 확인 |
| 파일 다운로드 | `GET` | `${attachmentUrl}` | 실제 JSON 데이터 확보 |

**보안 유의사항**: Webhook URL이 노출될 경우 누구나 백업 데이터에 접근하거나 수정할 수 있으므로 사용자 주의가 필요합니다.