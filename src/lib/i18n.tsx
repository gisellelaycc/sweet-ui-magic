import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'en' | 'zh' | 'ja' | 'ko';

const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

// All translatable strings keyed by dotted path
type Translations = Record<string, Record<Lang, string>>;

const T: Translations = {
  // ── Nav ──
  'nav.identity': { en: 'Identity', zh: '身份', ja: 'アイデンティティ', ko: '아이덴티티' },
  'nav.agents': { en: 'Agents', zh: '代理', ja: 'エージェント', ko: '에이전트' },
  'nav.signalMarketplace': { en: 'Signal Marketplace', zh: '信號市場', ja: 'シグナルマーケット', ko: '시그널 마켓' },
  'nav.records': { en: 'Records', zh: '紀錄', ja: 'レコード', ko: '레코드' },

  // ── Welcome Step ──
  'welcome.title': { en: 'Bring your 256D self to life.', zh: '喚醒你的 256D 自我。', ja: '256Dの自分を呼び覚まそう。', ko: '256D 자아를 깨우세요.' },
  'welcome.subtitle': { en: 'Build an OpenClaw agent that thinks like you.', zh: '打造一個與你思維同步的 OpenClaw 代理。', ja: 'あなたのように考える OpenClaw エージェントを構築。', ko: '당신처럼 생각하는 OpenClaw 에이전트를 만드세요.' },
  'welcome.placeholder': { en: 'Your name', zh: '你的名字', ja: 'あなたの名前', ko: '이름을 입력하세요' },
  'welcome.hint': { en: 'Shape your 256D space in 2 min.', zh: '2 分鐘塑造你的 256D 空間。', ja: '2分で256D空間を形成。', ko: '2분 만에 256D 공간을 만드세요.' },

  // ── Identity Step ──
  'identity.title': { en: 'Core Identity', zh: '核心身份', ja: 'コアアイデンティティ', ko: '코어 아이덴티티' },
  'identity.subtitle': { en: 'Optional signals. Nothing exposed.', zh: '可選信號，不會公開。', ja: '任意のシグナル。何も公開されません。', ko: '선택 신호. 노출되지 않습니다.' },
  'identity.cta': { en: 'Commit Core Layer', zh: '提交核心層', ja: 'コアレイヤーを確定', ko: '코어 레이어 확정' },
  'identity.age': { en: 'Age?', zh: '年齡？', ja: '年齢？', ko: '나이?' },
  'identity.gender': { en: 'Gender?', zh: '性別？', ja: '性別？', ko: '성별?' },
  'identity.height': { en: 'Height?', zh: '身高？', ja: '身長？', ko: '키?' },
  'identity.weight': { en: 'Weight?', zh: '體重？', ja: '体重？', ko: '체중?' },
  'identity.education': { en: 'Education?', zh: '學歷？', ja: '学歴？', ko: '학력?' },
  'identity.income': { en: 'Income?', zh: '收入？', ja: '収入？', ko: '수입?' },
  'identity.status': { en: 'Status?', zh: '狀態？', ja: 'ステータス？', ko: '상태?' },
  'identity.work': { en: 'Work?', zh: '職業？', ja: '仕事？', ko: '직업?' },
  'identity.living': { en: 'Living?', zh: '居住？', ja: '居住？', ko: '거주?' },

  // ── Category Step ──
  'category.title': { en: 'Signal Layers', zh: '信號層', ja: 'シグナルレイヤー', ko: '시그널 레이어' },
  'category.subtitle': { en: 'Choose which aspects of yourself shape this state.', zh: '選擇哪些面向來塑造這個狀態。', ja: 'どの側面でこの状態を形成するか選択。', ko: '어떤 면으로 이 상태를 형성할지 선택하세요.' },
  'category.proceed': { en: 'Proceed', zh: '繼續', ja: '続行', ko: '계속' },
  'category.tapActivate': { en: 'Tap to activate this signal', zh: '點擊以啟用此信號', ja: 'タップしてシグナルを有効化', ko: '탭하여 시그널 활성화' },
  'category.tapDeactivate': { en: '✓ Active — tap to deactivate', zh: '✓ 已啟用 — 點擊以停用', ja: '✓ 有効 — タップで無効化', ko: '✓ 활성 — 탭하여 비활성화' },
  'category.comingSoon': { en: 'Coming soon', zh: '即將推出', ja: '近日公開', ko: '곧 출시' },
  'category.andMore': { en: 'And more', zh: '更多', ja: 'その他', ko: '더 보기' },
  'category.minted': { en: 'minted', zh: '已鑄造', ja: 'ミント済み', ko: '민트됨' },

  // ── Sport Setup Step ──
  'sportSetup.title': { en: 'Baseline', zh: '基線校準', ja: 'ベースライン', ko: '베이스라인' },
  'sportSetup.subtitle': { en: 'A quiet calibration of your physical rhythm.', zh: '一次安靜的身體節奏校準。', ja: '身体リズムの静かなキャリブレーション。', ko: '신체 리듬의 조용한 교정.' },
  'sportSetup.frequency': { en: 'Exercise Frequency', zh: '運動頻率', ja: '運動頻度', ko: '운동 빈도' },
  'sportSetup.duration': { en: 'Session Duration', zh: '運動時長', ja: 'セッション時間', ko: '세션 시간' },
  'sportSetup.steps': { en: 'Average Daily Steps', zh: '日均步數', ja: '平均日歩数', ko: '일일 평균 걸음수' },
  'sportSetup.proceed': { en: 'Proceed', zh: '繼續', ja: '続行', ko: '계속' },

  // ── Sport Twin Step ──
  'sportTwin.title': { en: 'Most frequent activities', zh: '最常進行的活動', ja: '最も頻繁な活動', ko: '가장 자주 하는 활동' },
  'sportTwin.subtitle': { en: 'Order what feels essential.', zh: '排列你認為重要的項目。', ja: '重要と感じるものを並べて。', ko: '중요하다고 느끼는 것을 정렬하세요.' },
  'sportTwin.activities': { en: 'Select your most frequent activities', zh: '選擇你最常進行的活動', ja: '最も頻繁な活動を選択', ko: '가장 자주 하는 활동을 선택' },
  'sportTwin.activitiesHint': { en: 'Order reflects priority (up to 10).', zh: '順序代表優先順序（最多 10 項）。', ja: '順序は優先度を反映（最大10）。', ko: '순서는 우선순위를 반영합니다 (최대 10개).' },
  'sportTwin.selected': { en: 'Selected', zh: '已選擇', ja: '選択済み', ko: '선택됨' },
  'sportTwin.outfitStyle': { en: 'Outfit Style', zh: '穿搭風格', ja: 'コーデスタイル', ko: '의상 스타일' },
  'sportTwin.outfitHint': { en: 'Select styles that best represent your athletic expression.', zh: '選擇最能代表你運動風格的穿搭。', ja: 'あなたのアスレチックな表現に合うスタイルを選択。', ko: '당신의 운동 스타일을 가장 잘 나타내는 스타일을 선택하세요.' },
  'sportTwin.brands': { en: 'Brand Preferences', zh: '品牌偏好', ja: 'ブランド嗜好', ko: '브랜드 선호' },
  'sportTwin.brandsHint': { en: "Brands you've worn most in the past year.", zh: '過去一年最常穿的品牌。', ja: '過去1年で最も着用したブランド。', ko: '지난 1년간 가장 많이 착용한 브랜드.' },
  'sportTwin.commit': { en: 'Commit Layer', zh: '提交層', ja: 'レイヤーを確定', ko: '레이어 확정' },

  // ── Soul Step ──
  'soul.title': { en: 'Soul Layer', zh: '靈魂層', ja: 'ソウルレイヤー', ko: '소울 레이어' },
  'soul.subtitle': { en: 'Balance intention and instinct.', zh: '平衡意圖與直覺。', ja: '意図と本能のバランス。', ko: '의도와 본능의 균형.' },
  'soul.why': { en: 'Why do you train?', zh: '你為什麼訓練？', ja: 'なぜトレーニングするのか？', ko: '왜 훈련하나요?' },
  'soul.signature': { en: 'Soul Signature', zh: '靈魂簽名', ja: 'ソウルシグネチャー', ko: '소울 시그니처' },
  'soul.cta': { en: 'Review Your State →', zh: '檢視你的狀態 →', ja: '状態を確認 →', ko: '상태 확인 →' },

  // ── Generate Step ──
  'generate.signalNorm': { en: 'Signal Normalization', zh: '信號正規化', ja: 'シグナル正規化', ko: '시그널 정규화' },
  'generate.signalNormDesc': { en: 'Integrating and standardizing your identity signals.', zh: '整合與標準化你的身份信號。', ja: 'アイデンティティシグナルの統合と標準化。', ko: '신원 시그널을 통합하고 표준화합니다.' },
  'generate.dimProj': { en: 'Dimension Projection', zh: '維度投影', ja: '次元投影', ko: '차원 투영' },
  'generate.dimProjDesc': { en: 'Projecting signals into a 256-dimensional identity space.', zh: '將信號投影到 256 維身份空間。', ja: 'シグナルを256次元空間に投影。', ko: '시그널을 256차원 공간에 투영합니다.' },
  'generate.weightAgg': { en: 'Weight Aggregation', zh: '權重聚合', ja: '重み集約', ko: '가중치 집계' },
  'generate.weightAggDesc': { en: 'Calculating dimension intensity and layer distribution.', zh: '計算維度強度與層分佈。', ja: '次元の強度とレイヤー分布を計算。', ko: '차원 강도와 레이어 분포를 계산합니다.' },
  'generate.matrixEnc': { en: 'Matrix Encoding', zh: '矩陣編碼', ja: 'マトリックスエンコード', ko: '매트릭스 인코딩' },
  'generate.matrixEncDesc': { en: 'Encoding into 0–255 vector format.', zh: '編碼為 0–255 向量格式。', ja: '0–255ベクトル形式にエンコード。', ko: '0–255 벡터 형식으로 인코딩.' },
  'generate.vectorFin': { en: 'Vector Finalization', zh: '向量定稿', ja: 'ベクトル最終化', ko: '벡터 최종화' },
  'generate.vectorFinDesc': { en: 'A distilled expression of this moment.', zh: '此刻的精煉表達。', ja: 'この瞬間の凝縮された表現。', ko: '이 순간의 정제된 표현.' },
  'generate.soulSig': { en: 'Soul Signature', zh: '靈魂簽名', ja: 'ソウルシグネチャー', ko: '소울 시그니처' },

  // ── Review Step ──
  'review.title': { en: 'Identity Preview', zh: '身份預覽', ja: 'アイデンティティプレビュー', ko: '아이덴티티 미리보기' },
  'review.subtitle': { en: 'Not yet sealed. Review before recording.', zh: '尚未封存。錄入前請確認。', ja: 'まだ封印されていません。確認してください。', ko: '아직 봉인되지 않았습니다. 기록 전 확인하세요.' },
  'review.projection': { en: 'Twin Matrix Projection (256D)', zh: 'Twin Matrix 投影 (256D)', ja: 'Twin Matrix 投影 (256D)', ko: 'Twin Matrix 프로젝션 (256D)' },
  'review.quadrant': { en: 'Quadrant Position', zh: '象限位置', ja: '象限位置', ko: '사분면 위치' },
  'review.incompleteAxis': { en: 'Incomplete Axis', zh: '軸不完整', ja: '不完全な軸', ko: '축 불완전' },
  'review.density': { en: 'Identity Density', zh: '身份密度', ja: 'アイデンティティ密度', ko: '아이덴티티 밀도' },
  'review.densityOf': { en: 'of 256 dimensions active', zh: '在 256 維度中啟用', ja: '256次元中アクティブ', ko: '256차원 중 활성' },
  'review.layerMix': { en: 'Layer Mix', zh: '層分佈', ja: 'レイヤーミックス', ko: '레이어 믹스' },
  'review.refine': { en: 'Refine', zh: '精煉', ja: '調整', ko: '조정' },
  'review.commitState': { en: 'Commit State', zh: '提交狀態', ja: '状態を確定', ko: '상태 확정' },
  'review.committing': { en: 'Committing your identity…', zh: '正在提交你的身份…', ja: 'アイデンティティを確定中…', ko: '아이덴티티를 확정하는 중…' },
  'review.awaiting': { en: 'Awaiting wallet signature', zh: '等待錢包簽名', ja: 'ウォレット署名を待機中', ko: '지갑 서명 대기 중' },
  'review.committed': { en: 'Identity Committed', zh: '身份已提交', ja: 'アイデンティティ確定完了', ko: '아이덴티티 확정됨' },
  'review.preparing': { en: 'Preparing state for on-chain commitment.', zh: '正在準備鏈上提交狀態。', ja: 'オンチェーンコミットメントの準備中。', ko: '온체인 커밋을 위한 상태 준비 중.' },
  'review.confirmSig': { en: 'Please confirm the signature request.', zh: '請確認簽名請求。', ja: '署名リクエストを確認してください。', ko: '서명 요청을 확인해주세요.' },
  'review.sealed': { en: 'Your identity state has been sealed.', zh: '你的身份狀態已封存。', ja: 'アイデンティティ状態が封印されました。', ko: '아이덴티티 상태가 봉인되었습니다.' },
  'review.network': { en: 'Network', zh: '網路', ja: 'ネットワーク', ko: '네트워크' },
  'review.action': { en: 'Action', zh: '動作', ja: 'アクション', ko: '액션' },
  'review.gas': { en: 'Gas', zh: '手續費', ja: 'ガス', ko: '가스' },

  // ── Complete Step ──
  'complete.title': { en: 'Identity State Sealed.', zh: '身份狀態已封存。', ja: 'アイデンティティ状態が封印されました。', ko: '아이덴티티 상태가 봉인되었습니다.' },
  'complete.subtitle': { en: 'Your 256D imprint is now recorded.', zh: '你的 256D 印記已記錄。', ja: '256Dインプリントが記録されました。', ko: '256D 임프린트가 기록되었습니다.' },
  'complete.hash': { en: 'Identity Hash', zh: '身份雜湊', ja: 'アイデンティティハッシュ', ko: '아이덴티티 해시' },
  'complete.sbtId': { en: 'Minted SBT ID', zh: '已鑄造 SBT ID', ja: 'ミント済み SBT ID', ko: '민트된 SBT ID' },
  'complete.boundWallet': { en: '✓ Bound to sovereign wallet', zh: '✓ 已綁定主權錢包', ja: '✓ ソブリンウォレットにバインド', ko: '✓ 소버린 지갑에 바인딩됨' },
  'complete.dominantDim': { en: 'Dominant Dimensions', zh: '主導維度', ja: '支配的次元', ko: '지배적 차원' },
  'complete.vectorImprint': { en: 'Vector Imprint', zh: '向量印記', ja: 'ベクトルインプリント', ko: '벡터 임프린트' },
  'complete.snapshot': { en: '256D Snapshot at Mint Time', zh: '鑄造時的 256D 快照', ja: 'ミント時の256Dスナップショット', ko: '민트 시 256D 스냅샷' },
  'complete.activateAgent': { en: 'Activate an Agent →', zh: '啟動代理 →', ja: 'エージェントを起動 →', ko: '에이전트 활성화 →' },
  'complete.returnDashboard': { en: 'Return to Dashboard', zh: '返回儀表板', ja: 'ダッシュボードに戻る', ko: '대시보드로 돌아가기' },

  // ── Auth Step (Agent) ──
  'agent.yourAgents': { en: 'Your Agents', zh: '你的代理', ja: 'あなたのエージェント', ko: '당신의 에이전트' },
  'agent.manageCreate': { en: 'Manage and create agents.', zh: '管理與建立代理。', ja: 'エージェントの管理と作成。', ko: '에이전트를 관리하고 생성합니다.' },
  'agent.createNew': { en: 'Create New Agent', zh: '建立新代理', ja: '新しいエージェントを作成', ko: '새 에이전트 만들기' },
  'agent.activate': { en: 'Activate Your Agent', zh: '啟動你的代理', ja: 'エージェントを起動', ko: '에이전트 활성화' },
  'agent.activateDesc': { en: 'Let this identity act on your behalf.', zh: '讓這個身份代你行動。', ja: 'このアイデンティティにあなたの代わりに行動させます。', ko: '이 아이덴티티가 당신을 대신하여 행동합니다.' },
  'agent.name': { en: 'Agent Name', zh: '代理名稱', ja: 'エージェント名', ko: '에이전트 이름' },
  'agent.createAgent': { en: 'Create Agent', zh: '建立代理', ja: 'エージェント作成', ko: '에이전트 생성' },
  'agent.viewExisting': { en: 'View existing agents', zh: '查看現有代理', ja: '既存のエージェントを表示', ko: '기존 에이전트 보기' },
  'agent.behavior': { en: 'Behavior', zh: '行為模式', ja: '行動', ko: '행동' },
  'agent.active': { en: 'Active', zh: '主動', ja: 'アクティブ', ko: '액티브' },
  'agent.passive': { en: 'Passive', zh: '被動', ja: 'パッシブ', ko: '패시브' },
  'agent.matchingStrategy': { en: 'Matching Strategy', zh: '匹配策略', ja: 'マッチング戦略', ko: '매칭 전략' },
  'agent.scope': { en: 'Scope', zh: '範圍', ja: 'スコープ', ko: '범위' },
  'agent.scopeHint': { en: 'Grants structured summary access only — no raw values exposed.', zh: '僅授予結構化摘要存取權限 — 不公開原始值。', ja: '構造化サマリーアクセスのみ — 生の値は公開されません。', ko: '구조화된 요약 접근만 허용 — 원시 값은 노출되지 않습니다.' },
  'agent.tradingAuth': { en: 'Trading Authority', zh: '交易授權', ja: 'トレーディング権限', ko: '트레이딩 권한' },
  'agent.spendLimits': { en: 'Set spend limits for auto-approved tasks.', zh: '設定自動核准任務的支出上限。', ja: '自動承認タスクの支出上限を設定。', ko: '자동 승인 작업의 지출 한도를 설정합니다.' },
  'agent.maxPerTask': { en: 'Max / task', zh: '每次上限', ja: 'タスク上限', ko: '작업당 최대' },
  'agent.dailyCap': { en: 'Daily cap', zh: '每日上限', ja: '日次上限', ko: '일일 한도' },
  'agent.weeklyCap': { en: 'Weekly cap', zh: '每週上限', ja: '週次上限', ko: '주간 한도' },
  'agent.fullAutoWarning': { en: '⚠ I understand Full Auto grants unrestricted trading authority', zh: '⚠ 我了解 Full Auto 授予無限制交易授權', ja: '⚠ Full Autoが無制限のトレーディング権限を付与することを理解', ko: '⚠ Full Auto가 무제한 트레이딩 권한을 부여함을 이해합니다' },
  'agent.authDuration': { en: 'Authorization Duration', zh: '授權期限', ja: '認可期間', ko: '인가 기간' },
  'agent.days': { en: 'Days:', zh: '天數：', ja: '日数：', ko: '일수:' },
  'agent.riskControls': { en: 'Risk Controls', zh: '風險控制', ja: 'リスク管理', ko: '리스크 관리' },
  'agent.riskHint': { en: 'Reduce financial and operational exposure.', zh: '降低財務與運營風險。', ja: '財務および運用リスクを軽減。', ko: '재무 및 운영 위험을 줄입니다.' },
  'agent.saveConfig': { en: 'Save Configuration →', zh: '儲存設定 →', ja: '設定を保存 →', ko: '설정 저장 →' },
  'agent.saveDraft': { en: 'Save to Draft', zh: '存為草稿', ja: '下書き保存', ko: '임시 저장' },
  'agent.editAuth': { en: 'Edit Authorization', zh: '編輯授權', ja: '認可を編集', ko: '인가 편집' },
  'agent.autonomy': { en: 'Autonomy', zh: '自主性', ja: '自律性', ko: '자율성' },
  'agent.telegram': { en: 'Telegram', zh: 'Telegram', ja: 'Telegram', ko: 'Telegram' },
  'agent.connected': { en: '✓ Connected', zh: '✓ 已連接', ja: '✓ 接続済み', ko: '✓ 연결됨' },
  'agent.notConnected': { en: 'Not connected', zh: '未連接', ja: '未接続', ko: '연결 안됨' },

  // ── Telegram Sub-step ──
  'telegram.title': { en: 'Connect Channel', zh: '連結頻道', ja: 'チャネルを接続', ko: '채널 연결' },
  'telegram.subtitle': { en: 'Link Telegram to activate your agent.', zh: '連接 Telegram 以啟動代理。', ja: 'Telegramを接続してエージェントを起動。', ko: 'Telegram을 연결하여 에이전트를 활성화하세요.' },
  'telegram.statusDraft': { en: 'Status: DRAFT — Connect Telegram to activate.', zh: '狀態：草稿 — 連接 Telegram 以啟動。', ja: 'ステータス：下書き — Telegramを接続して起動。', ko: '상태: 초안 — Telegram을 연결하여 활성화.' },
  'telegram.connect': { en: '🔗 Connect Telegram', zh: '🔗 連接 Telegram', ja: '🔗 Telegramを接続', ko: '🔗 Telegram 연결' },
  'telegram.connectedLabel': { en: '✓ Telegram Connected', zh: '✓ Telegram 已連接', ja: '✓ Telegram 接続済み', ko: '✓ Telegram 연결됨' },
  'telegram.hint': { en: 'Required for agent notifications and task dispatch.', zh: '代理通知與任務派遣所需。', ja: 'エージェント通知とタスク配信に必要。', ko: '에이전트 알림 및 작업 배포에 필요합니다.' },

  // ── Activated Sub-step ──
  'activated.title': { en: 'Agent Activated', zh: '代理已啟動', ja: 'エージェント起動完了', ko: '에이전트 활성화됨' },
  'activated.subtitle': { en: 'Your agent is now operating under your committed identity.', zh: '你的代理現在依據你已提交的身份運作。', ja: 'エージェントはあなたのアイデンティティで稼働中。', ko: '에이전트가 당신의 아이덴티티로 운영 중입니다.' },
  'activated.agent': { en: 'Agent', zh: '代理', ja: 'エージェント', ko: '에이전트' },
  'activated.status': { en: 'Status', zh: '狀態', ja: 'ステータス', ko: '상태' },
  'activated.returnDashboard': { en: 'Return to Dashboard', zh: '返回儀表板', ja: 'ダッシュボードに戻る', ko: '대시보드로 돌아가기' },
  'activated.createAnother': { en: 'Create Another Agent', zh: '建立另一個代理', ja: '別のエージェントを作成', ko: '다른 에이전트 만들기' },

  // ── Identity Dashboard Page ──
  'dashboard.identityState': { en: 'Identity State', zh: '身份狀態', ja: 'アイデンティティ状態', ko: '아이덴티티 상태' },
  'dashboard.sealed': { en: '● Sealed', zh: '● 已封存', ja: '● 封印済み', ko: '● 봉인됨' },
  'dashboard.lastSealed': { en: 'Last sealed · 2 hours ago', zh: '上次封存 · 2 小時前', ja: '最終封印 · 2時間前', ko: '마지막 봉인 · 2시간 전' },
  'dashboard.identityHash': { en: 'Identity Hash', zh: '身份雜湊', ja: 'アイデンティティハッシュ', ko: '아이덴티티 해시' },
  'dashboard.mintedSbt': { en: 'Minted SBT ID', zh: '已鑄造 SBT ID', ja: 'ミント済み SBT ID', ko: '민트된 SBT ID' },
  'dashboard.boundWallet': { en: 'Bound Wallet', zh: '綁定錢包', ja: 'バインドウォレット', ko: '바인딩된 지갑' },
  'dashboard.vectorImprint': { en: 'Vector Imprint', zh: '向量印記', ja: 'ベクトルインプリント', ko: '벡터 임프린트' },
  'dashboard.stateInsight': { en: 'State Insight', zh: '狀態洞察', ja: '状態インサイト', ko: '상태 인사이트' },
  'dashboard.layerMix': { en: 'Layer Mix', zh: '層分佈', ja: 'レイヤーミックス', ko: '레이어 믹스' },
  'dashboard.aiSummary': { en: 'AI Summary', zh: 'AI 摘要', ja: 'AI サマリー', ko: 'AI 요약' },
  'dashboard.dominantDim': { en: 'Dominant Dimensions', zh: '主導維度', ja: '支配的次元', ko: '지배적 차원' },
  'dashboard.versionHistory': { en: 'Version History', zh: '版本歷史', ja: 'バージョン履歴', ko: '버전 기록' },
  'dashboard.boundAgents': { en: 'Bound Agents', zh: '綁定代理', ja: 'バインドエージェント', ko: '바인딩된 에이전트' },
  'dashboard.manageState': { en: 'Manage State', zh: '管理狀態', ja: '状態管理', ko: '상태 관리' },
  'dashboard.refineState': { en: 'Refine State', zh: '精煉狀態', ja: '状態を調整', ko: '상태 조정' },
  'dashboard.reseal': { en: 'Re-seal', zh: '重新封存', ja: '再封印', ko: '재봉인' },
  'dashboard.exportVector': { en: 'Export Vector', zh: '匯出向量', ja: 'ベクトルをエクスポート', ko: '벡터 내보내기' },
  'dashboard.shareSnapshot': { en: 'Share Snapshot', zh: '分享快照', ja: 'スナップショットを共有', ko: '스냅샷 공유' },
  'dashboard.view': { en: 'View', zh: '檢視', ja: '表示', ko: '보기' },
  'dashboard.compare': { en: 'Compare', zh: '比較', ja: '比較', ko: '비교' },
  'dashboard.current': { en: 'current', zh: '目前', ja: '現在', ko: '현재' },

  // ── Agent Studio Page ──
  'agentStudio.title': { en: 'Agent Studio', zh: 'Agent Studio', ja: 'Agent Studio', ko: 'Agent Studio' },
  'agentStudio.subtitle': { en: 'Create, manage, and monitor your agents.', zh: '建立、管理和監控你的代理。', ja: 'エージェントの作成、管理、モニタリング。', ko: '에이전트를 생성, 관리 및 모니터링합니다.' },
  'agentStudio.active': { en: 'Active:', zh: '啟用中：', ja: 'アクティブ:', ko: '활성:' },
  'agentStudio.drafts': { en: 'Drafts:', zh: '草稿：', ja: '下書き:', ko: '초안:' },
  'agentStudio.totalEarnings': { en: 'Total Earnings:', zh: '總收入：', ja: '総収益:', ko: '총 수익:' },
  'agentStudio.newAgent': { en: '+ New Agent', zh: '+ 新建代理', ja: '+ 新規エージェント', ko: '+ 새 에이전트' },
  'agentStudio.editAgent': { en: 'Edit Agent', zh: '編輯代理', ja: 'エージェント編集', ko: '에이전트 편집' },
  'agentStudio.taskTypes': { en: 'Task Types', zh: '任務類型', ja: 'タスクタイプ', ko: '작업 유형' },
  'agentStudio.channels': { en: 'Channels', zh: '頻道', ja: 'チャネル', ko: '채널' },
  'agentStudio.noChannels': { en: 'No channels connected', zh: '尚未連接頻道', ja: 'チャネル未接続', ko: '연결된 채널 없음' },
  'agentStudio.configure': { en: 'Configure', zh: '設定', ja: '設定', ko: '설정' },
  'agentStudio.pause': { en: 'Pause', zh: '暫停', ja: '一時停止', ko: '일시정지' },
  'agentStudio.continueSetup': { en: 'Continue Setup', zh: '繼續設定', ja: 'セットアップ続行', ko: '설정 계속' },

  // ── Records (Active Authorizations) Page ──
  'records.title': { en: 'Issued Tokens', zh: '已發行 Tokens', ja: '発行済みトークン', ko: '발행된 토큰' },
  'records.subtitle': { en: 'All scoped access tokens.', zh: '所有範圍存取 Token。', ja: 'すべてのスコープ付きアクセストークン。', ko: '모든 범위 지정 액세스 토큰.' },
  'records.remaining': { en: 'Remaining', zh: '剩餘', ja: '残り', ko: '남은 수' },
  'records.expires': { en: 'Expires', zh: '過期', ja: '有効期限', ko: '만료' },
  'records.expired': { en: 'Expired', zh: '已過期', ja: '期限切れ', ko: '만료됨' },
  'records.revoke': { en: 'Revoke', zh: '撤銷', ja: '取り消し', ko: '취소' },
  'records.viewDetails': { en: 'View Details', zh: '檢視詳情', ja: '詳細を表示', ko: '상세 보기' },
  'records.renew': { en: 'Renew', zh: '續期', ja: '更新', ko: '갱신' },

  // ── Signal Marketplace Page ──
  'marketplace.title': { en: 'Signal Marketplace', zh: '信號市場', ja: 'シグナルマーケットプレイス', ko: '시그널 마켓플레이스' },
  'marketplace.subtitle': { en: 'Scoped access requests matched to your identity.', zh: '與你身份匹配的範圍存取請求。', ja: 'あなたのアイデンティティに一致するスコープ付きリクエスト。', ko: '당신의 아이덴티티에 매칭된 범위 지정 요청.' },
  'marketplace.activeSignals': { en: 'Active Signals:', zh: '活躍信號：', ja: 'アクティブシグナル:', ko: '활성 시그널:' },
  'marketplace.availableQuota': { en: 'Available Quota:', zh: '可用配額：', ja: '利用可能クォータ:', ko: '사용 가능한 할당:' },
  'marketplace.remaining': { en: 'remaining', zh: '剩餘', ja: '残り', ko: '남음' },
  'marketplace.earned': { en: 'Earned:', zh: '已賺取：', ja: '獲得:', ko: '획득:' },
  'marketplace.all': { en: 'All', zh: '全部', ja: 'すべて', ko: '전체' },
  'marketplace.passive': { en: 'Passive', zh: '被動', ja: 'パッシブ', ko: '패시브' },
  'marketplace.tasks': { en: 'Tasks', zh: '任務', ja: 'タスク', ko: '작업' },
  'marketplace.rewards': { en: 'Rewards', zh: '獎勵', ja: 'リワード', ko: '보상' },
  'marketplace.allLayers': { en: 'All Layers', zh: '全部層', ja: '全レイヤー', ko: '전체 레이어' },
  'marketplace.whyMatch': { en: 'Why this matches you', zh: '為什麼與你匹配', ja: 'なぜあなたに一致するか', ko: '왜 당신과 매칭되는지' },
  'marketplace.paidTask': { en: 'Paid Task', zh: '付費任務', ja: '有料タスク', ko: '유료 작업' },
  'marketplace.passiveSignal': { en: 'Passive Signal', zh: '被動信號', ja: 'パッシブシグナル', ko: '패시브 시그널' },
  'marketplace.noSignals': { en: 'No signals match this filter.', zh: '沒有符合此篩選條件的信號。', ja: 'このフィルターに一致するシグナルはありません。', ko: '이 필터에 일치하는 시그널이 없습니다.' },
  'marketplace.viewConsumes': { en: 'View consumes 1 usage · Dismiss is free', zh: '檢視消耗 1 次使用額度 · 忽略免費', ja: '表示で1使用消費 · 却下は無料', ko: '보기는 1회 사용 · 무시는 무료' },
  'marketplace.acceptLocks': { en: 'Accept locks 1 quota · Payment on completion', zh: '接受鎖定 1 配額 · 完成後付款', ja: '承認で1クォータロック · 完了時に支払い', ko: '수락 시 1 할당 잠금 · 완료 시 결제' },
  'marketplace.view': { en: 'View', zh: '檢視', ja: '表示', ko: '보기' },
  'marketplace.dismiss': { en: 'Dismiss', zh: '忽略', ja: '却下', ko: '무시' },
  'marketplace.reviewDetails': { en: 'Review Details', zh: '檢視詳情', ja: '詳細を確認', ko: '상세 확인' },
  'marketplace.accept': { en: 'Accept', zh: '接受', ja: '承認', ko: '수락' },
  'marketplace.decline': { en: 'Decline', zh: '拒絕', ja: '辞退', ko: '거절' },

  // ── Settings Page ──
  'settings.title': { en: 'Settings', zh: '設定', ja: '設定', ko: '설정' },
  'settings.subtitle': { en: 'Sovereign configuration & on-chain state', zh: '主權設定與鏈上狀態', ja: 'ソブリン設定とオンチェーン状態', ko: '소버린 설정 및 온체인 상태' },
  'settings.wallet': { en: 'Wallet', zh: '錢包', ja: 'ウォレット', ko: '지갑' },
  'settings.statusConnected': { en: '● Connected', zh: '● 已連接', ja: '● 接続済み', ko: '● 연결됨' },
  'settings.address': { en: 'Address', zh: '地址', ja: 'アドレス', ko: '주소' },
  'settings.market': { en: 'Market', zh: '市場', ja: 'マーケット', ko: '마켓' },
  'settings.marketId': { en: 'Market ID', zh: '市場 ID', ja: 'マーケットID', ko: '마켓 ID' },
  'settings.preferences': { en: 'Preferences', zh: '偏好設定', ja: '設定', ko: '환경설정' },
  'settings.notifications': { en: 'Notifications', zh: '通知', ja: '通知', ko: '알림' },
  'settings.privacyMode': { en: 'Privacy Mode', zh: '隱私模式', ja: 'プライバシーモード', ko: '프라이버시 모드' },

  // ── Update Identity Page ──
  'update.title': { en: 'Update State', zh: '更新狀態', ja: '状態を更新', ko: '상태 업데이트' },
  'update.subtitle': { en: 'Modify your identity layers and configuration', zh: '修改你的身份層與設定', ja: 'アイデンティティレイヤーと設定を変更', ko: '아이덴티티 레이어와 설정을 수정' },
  'update.coreLayer': { en: 'Core Layer', zh: '核心層', ja: 'コアレイヤー', ko: '코어 레이어' },
  'update.signalLayers': { en: 'Signal Layers', zh: '信號層', ja: 'シグナルレイヤー', ko: '시그널 레이어' },
  'update.soulLayer': { en: 'Soul Layer', zh: '靈魂層', ja: 'ソウルレイヤー', ko: '소울 레이어' },
  'update.edit': { en: '✏️ Edit', zh: '✏️ 編輯', ja: '✏️ 編集', ko: '✏️ 편집' },
  'update.editHint': { en: 'Edit to modify biological & social layers', zh: '編輯以修改生物與社交層', ja: '生物学的・社会的レイヤーを編集', ko: '생물학적 및 사회적 레이어를 편집' },
  'update.activate': { en: 'Activate', zh: '啟用', ja: '有効化', ko: '활성화' },
  'update.noTags': { en: 'No signal tags committed', zh: '尚未提交信號標籤', ja: 'シグナルタグ未確定', ko: '커밋된 시그널 태그 없음' },
  'update.remint': { en: 'Re-mint State', zh: '重新鑄造狀態', ja: '状態を再ミント', ko: '상태 리민트' },

  // ── Risk Controls ──
  'risk.pauseCap': { en: 'Pause when daily cap reached', zh: '達到每日上限時暫停', ja: '日次上限到達時に一時停止', ko: '일일 한도 도달 시 일시정지' },
  'risk.switchManual': { en: 'Switch to Manual after cap reached', zh: '達到上限後切換為手動', ja: '上限到達後に手動に切替', ko: '한도 도달 후 수동으로 전환' },
  'risk.restrictTask': { en: 'Restrict to selected task types', zh: '限制為已選任務類型', ja: '選択したタスクタイプに制限', ko: '선택한 작업 유형으로 제한' },
  'risk.restrictBrand': { en: 'Restrict to approved brands', zh: '限制為已核准品牌', ja: '承認済みブランドに制限', ko: '승인된 브랜드로 제한' },

  // ── Task Capability ──
  'taskCap.title': { en: 'Task Capability', zh: '任務能力', ja: 'タスク能力', ko: '작업 능력' },
  'taskCap.subTasks': { en: 'sub-tasks', zh: '子任務', ja: 'サブタスク', ko: '하위 작업' },
  'taskCap.remove': { en: 'Remove', zh: '移除', ja: '削除', ko: '제거' },

  // ── Missions Page ──
  'missions.title': { en: 'Signal Requests', zh: '信號請求', ja: 'シグナルリクエスト', ko: '시그널 요청' },
  'missions.subtitle': { en: 'Scoped opportunities from brands & agents', zh: '來自品牌與代理的範圍機會', ja: 'ブランドとエージェントからのスコープ付き機会', ko: '브랜드와 에이전트의 범위 지정 기회' },
  'missions.signalMatch': { en: 'Signal Match', zh: '信號匹配', ja: 'シグナルマッチ', ko: '시그널 매치' },
  'missions.moreLikeThis': { en: 'More like this', zh: '更多類似的', ja: 'この類似', ko: '이와 유사한' },
  'missions.viewConsumes': { en: 'View consumes 1 usage quota · Dismiss is free', zh: '檢視消耗 1 次使用額度 · 忽略免費', ja: '表示で1使用クォータ消費 · 却下は無料', ko: '보기는 1 사용 할당 소모 · 무시는 무료' },
  'missions.acceptLocks': { en: 'Accept locks 1 usage quota · Payment releases on completion', zh: '接受鎖定 1 配額 · 完成後付款', ja: '承認で1クォータロック · 完了時に支払い', ko: '수락 시 1 할당 잠금 · 완료 시 결제' },

  // ── Common ──
  'common.status': { en: 'Status', zh: '狀態', ja: 'ステータス', ko: '상태' },
  'common.tasks': { en: 'Tasks:', zh: '任務：', ja: 'タスク:', ko: '작업:' },
  'common.earned': { en: 'Earned:', zh: '已賺取：', ja: '獲得:', ko: '획득:' },
  'common.created': { en: 'Created:', zh: '建立於：', ja: '作成:', ko: '생성:' },
  'common.physical': { en: 'Physical', zh: '物理', ja: 'フィジカル', ko: '피지컬' },
  'common.digital': { en: 'Digital', zh: '數位', ja: 'デジタル', ko: '디지털' },
  'common.social': { en: 'Social', zh: '社交', ja: 'ソーシャル', ko: '소셜' },
  'common.spiritual': { en: 'Spiritual', zh: '靈性', ja: 'スピリチュアル', ko: '스피리추얼' },
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  langLabels: typeof LANG_LABELS;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const t = useCallback((key: string): string => {
    const entry = T[key];
    if (!entry) return key;
    return entry[lang] ?? entry.en ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, langLabels: LANG_LABELS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
