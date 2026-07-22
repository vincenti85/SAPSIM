# SAP ECC 시뮬레이터 프로젝트

## 하네스: SAP ECC 웹 시뮬레이터

**목표:** 미국 자동차 부품 제조업 기준 SAP ECC 엔드투엔드(MM→PP→FI/CO→SD) 실습 시뮬레이터 웹 솔루션 개발

**트리거:** SAP 시뮬레이터 개발, 모듈 추가/수정, BOM 설계, 자재 업로드 기능, 시나리오 수정 등 이 프로젝트 관련 작업 요청 시 `sap-simulator-orchestrator` 스킬을 사용하라. 단순 SAP 개념 질문은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-30 | 초기 구성 | 전체 | 신규 프로젝트 |
| 2026-05-30 | 자재 코드 업로드 기능 추가 | orchestrator, html-simulator-pattern, bom-multilevel | 사용자 요구사항 반영 |
| 2026-05-30 | 멀티레벨 BOM 설계 반영 | sap-process-design/references/bom-multilevel.md | HALB→FERT 멀티레벨 원가 롤업 |
| 2026-06-03 | 저작권 리스크 Top 10 검토 + SAP↔Oracle 매핑 문서 생성 | sap-process-design/references/sap-oracle-mapping.md | 웹 배포 시 SAP/제3자 IP 리스크 평가 |
| 2026-06-03 | 디브랜딩 패치: 제품명·실존기업명(Ford/Alcoa)·면책문구 | dist/erp-simulator.html | 상표권/후원오인 리스크 제거 |
| 2026-06-03 | 자재유형 리네이밍 FERT/HALB/ROH→FG/SF/RM (코드+타입) | dist/erp-simulator.html | SAP 표준 자재유형 약어 제거 (로직 검증 완료) |
| 2026-06-03 | T-code 전면 중립화 (UI 제거, Dryrun F01~F32 기능번호화) | dist/erp-simulator.html, sap-oracle-mapping.md | SAP 조어 T-code UI 노출 제거, 매핑은 참조 문서로 이관 |
| 2026-06-03 | 파일명/빌드 디브랜딩 + Vercel 프로덕션 배포 | dist/erp-simulator.html, build.js, vercel.json, package.json | erp-simulator.html 리네임, 라이브 배포 (dist-eta-tan-10.vercel.app) |
| 2026-06-03 | 인앱 'T-code 매핑' 버튼+모달 추가 (언어토글 하단, Fn↔SAP↔Oracle 32행) | dist/erp-simulator.html | 학습용 SAP 대조 참조표를 모달로 제공 (재배포) |
| 2026-06-04 | 'Introduction' 15초 자동재생 투어 추가 (PIN 게이트 CTA + 헤더 버튼, 7씬) | dist/erp-simulator.html | PIN 없이 전체 구조 미리보기 제공 (재배포) |
| 2026-06-13 | '원가모델 비교' 탭 추가 (클래식 표준원가 vs Material Ledger 토글, 감사 Q&A·전표·모순 콜아웃) | dist/erp-simulator.html, docs/superpowers/specs/2026-06-13-costing-model-comparison-design.md | 내부감사 표준/실제원가 질의응답 보고서 반영, ML 중심 + 클래식 보충 대조 |
| 2026-06-13 | '원가모델 비교' 탭 T-code 중립화 (KO88→F21·F22, CKMLCP→F28~F31, KE27→F32, CKM3/MR21→설명문) | dist/erp-simulator.html | UI T-code 미노출 정책 일관성 (매핑은 'T-code 매핑' 모달 참조) |
| 2026-06-13 | 듀얼뷰 역할기반 내비 추가 (현업 모드↔회계 모드 토글, 6역할 그룹 + 역할 안내 배너) | dist/erp-simulator.html, docs/superpowers/specs/2026-06-13-dual-view-role-navigation-design.md | 현업 진입장벽 피드백 반영 (SAP Fiori 역할기반), 회계 모드는 현행 보존 |
| 2026-06-13 | Flow 탭(전체 업무 흐름) 친화적 리디자인 (일상어 주+SAP 소자병기, 여정 카드·그라데이션·번호배지, P2P/O2C·RM→SF→FG 제거) | dist/erp-simulator.html | "너무 IT 톤" 피드백 반영, 현업 가독성 향상 (커밋 f8333b6, Vercel 배포) |
| 2026-06-13 | 팀장 가이드 모달 친화 톤 통일 (모듈코드 접두 제목→일상어, P2P/O2C→구매·판매 사이클, 핸드오프 매트릭스 한글화) | dist/erp-simulator.html | Flow 탭과 톤 일관성 (커밋 4b33320, Vercel 배포) |
| 2026-06-13 | 현업/회계 모드 차별화 강화 (현업=역할 런치패드 홈+인디고, 회계=분개원장 홈+틸, 모드 전환 시 홈 리셋, 상시 모드 배너) | dist/erp-simulator.html | "모드 전환 차이 없음" 피드백 반영, 진입화면·색상·접근방식 명확 구분 |
| 2026-06-13 | 회계 모드 홈을 5단계 결산 로드맵으로 교체 (①표준원가→②거래→③정산→④ML결산→⑤CO-PA, 각 단계 이동버튼) | dist/erp-simulator.html | 빈 분개장 진입 문제 보완, 시작점=표준원가·종점=CO-PA 안내 |
| 2026-07-01 | UI Quick Win: 헤더 전역 진행 스테퍼(마스터~매출 5모듈 n/총계) + StepButton "다음 할 일" 배지(색맹 이중인코딩) 추가 | dist/erp-simulator.html | 유사 서비스 벤치마킹(NetSuite/Duolingo류) 기반 내비게이션 개선 1차 |
| 2026-07-01 | 현업 모드 역할 카드에 "지금 할 일" 위젯 추가 + Intro/T-code매핑/팀장가이드를 '학습 도구' 앱 스위처(그리드 드롭다운)로 통합 | dist/erp-simulator.html | Mid-term UI 개선 (좌측 슬림 사이드바는 고위험 구조변경으로 보류) |
| 2026-07-01 | '일반경비(General/Overhead Expense)' 메뉴 신설 — 원가센터 발생(FB50)→조회(KSB1)→배분(KSU5)→손익반영(KE30), Finance/원가·결산 그룹 편입, T-code매핑 F33~F36 추가 | dist/erp-simulator.html | SG&A성 간접비 처리 흐름 부재 보완 (사용자 요청 신규 메뉴 기획) |
| 2026-07-01 | 'Introduction' 투어 15초→40초 확장 (7씬→10씬, 듀얼뷰·일반경비·진행스테퍼 신규 씬 추가, F01~F32→F01~F36 갱신) | dist/erp-simulator.html | 신규 기능 반영 및 투어 콘텐츠 보강 요청 |
| 2026-07-01 | 좌측 슬림 사이드바 도입 (sm+ 화면에서 그룹 내비를 세로 아이콘 바로 이동, 모바일은 기존 가로 탭 유지) + SAPSIM main 푸시·workspace 브랜치 백업 | dist/erp-simulator.html | Mid-term UI 잔여 항목 완료, 원격 배포 반영 |
| 2026-07-02 | Notion 스타일 라이트 테마 + 전면 단계형 노출 (화이트 헤더·웜뉴트럴 캔버스, StepButton=완료 축약/다음 할 일 단일 CTA/미래 🔒 잠금, 반품·재고실사·후속차변·고객반품·MR21 AdvancedSection 기본 접힘) | dist/erp-simulator.html | "초보자에게 복잡" 피드백 반영 — 디자인 시스템 개선 + progressive disclosure (Vercel 배포) |
| 2026-07-02 | '발표 모드 (30분)' 신설 — 9챕터 스토리바(전체흐름3·마스터3·구매4·생산5·원가결산5·일반경비3·매출3·CO-PA2·분개원장2=30분, 경과 타이머·발표 포인트·이전/다음) + 회계 모드 그룹을 스토리 순서로 재배열(Tour/Intro→'참고자료' 맨 뒤) | dist/erp-simulator.html | 전체 내용을 30분 단일 스토리로 프리젠테이션 가능하도록 메뉴·구성 수정 (Vercel 배포) |
| 2026-07-02 | 발표 모드 챕터별 전면 스토리 슬라이드 팝업 추가 (챕터 진입 시 그라데이션 풀스크린 슬라이드: 아이콘·챕터 n/9·소요분·번호 매긴 발표 포인트, 클릭/CTA로 닫기, 스토리바 🖼 버튼으로 재열기) | dist/erp-simulator.html | 슬라이드마다 스토리가 직관적으로 보이도록 팝업 요청 반영 (Vercel 배포) |
| 2026-07-22 | **[결함수정]** 분개원장을 buildJournals 파생으로 재작성 (변수 변경 시 원장 미반영 결함 해소), 일반경비 F33~F36 원장 누락 보완, 하드코딩 잔액표→시산표(차변=대변 검증), @media print 신설(크롬 제거·면책 스탬프) | dist/erp-simulator.html | 감사 자료로 출력할 원장이 화면과 불일치하던 문제 (교육·감사 용도 리서치 0단계) |
| 2026-07-22 | PIN 게이트 앞 랜딩 페이지 신설 (Hero·학습성과 5개·9챕터 커리큘럼 미리보기·소요시간 3단 배지·제작배경/면책) + PIN 문구 재프레이밍 | dist/erp-simulator.html | 첫 화면에 도구 설명이 전무하던 문제 (ERPsim/Coursera/Duolingo 벤치마킹, 1단계) |
| 2026-07-22 | 감사 추적성 3종: 중립 전표번호 체계(PO/MD/AC/PR/SO/DL/IV/CC/CK/ML/PA)+선행문서 체인, 통제점 10건(CONTROLS)과 StepButton 🛡 배지, 용어집 모달 14항목 | dist/erp-simulator.html | AuditBoard/SOX RCM 표준 구성요소 반영 (2단계) |
| 2026-07-22 | 통제 매트릭스(RCM) 탭 신설 + 감사 패키지 인쇄(표지·내러티브·전표목록·시산표·RCM·용어집 단일 문서) | dist/erp-simulator.html | 감사인 전달용 패키지화 (3단계) |
| 2026-07-22 | 차이 배부 폭포도(재고 vs COGS 정책 토글), 워크스루 시트 탭, 스냅샷 저장/불러오기(JSON 재현성) | dist/erp-simulator.html | 감사 질의 심화 대응 및 재현성 확보 (4단계) |
