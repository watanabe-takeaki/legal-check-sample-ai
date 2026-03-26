export interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio';
  placeholder: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export const documentTypes: DocumentType[] = [
  {
    id: 'nda',
    name: 'NDA（秘密保持契約）',
    description: '企業間・個人間の秘密情報を保護する契約書を作成します。',
    icon: '🔒',
    color: '#6366f1',
    fields: [
      { id: 'parties', label: '情報を共有する相手', type: 'textarea', placeholder: '例：株式会社ABC（東京都渋谷区...）と当社との間で...', required: true },
      { id: 'infoType', label: '共有する情報の種類', type: 'textarea', placeholder: '例：顧客データ、製品設計情報、アルゴリズム、営業戦略など', required: true },
      { id: 'direction', label: '秘密保持の方向性', type: 'radio', placeholder: '', required: true, options: [{ value: 'mutual', label: '相互型（双方が秘密情報を開示）' }, { value: 'one-way', label: '一方向型（一方のみが開示）' }] },
      { id: 'duration', label: '契約期間', type: 'text', placeholder: '例：2年間', required: false },
      { id: 'additionalInfo', label: 'その他の要望・特記事項', type: 'textarea', placeholder: '例：特定の技術分野に関する追加条項が必要など', required: false },
    ],
  },
  {
    id: 'freelance',
    name: 'フリーランス契約書',
    description: '独立請負人との業務委託契約書を作成します。',
    icon: '💼',
    color: '#8b5cf6',
    fields: [
      { id: 'role', label: '依頼者/請負人の立場', type: 'radio', placeholder: '', required: true, options: [{ value: 'client', label: '依頼者（発注側）' }, { value: 'freelancer', label: '請負人（受注側）' }] },
      { id: 'workType', label: '業務の種類・内容', type: 'textarea', placeholder: '例：Webサイトのデザイン・開発、3ページ構成のコーポレートサイト', required: true },
      { id: 'payment', label: '支払い構造', type: 'textarea', placeholder: '例：総額50万円、着手金20%、中間30%、完了時50%', required: true },
      { id: 'duration', label: '契約期間', type: 'text', placeholder: '例：2024年4月1日〜2024年6月30日', required: true },
      { id: 'additionalInfo', label: 'その他の要望', type: 'textarea', placeholder: '例：修正回数の上限、著作権の帰属先など', required: false },
    ],
  },
  {
    id: 'llc',
    name: 'LLC運営協定書',
    description: '合同会社の運営ルール・メンバー間の合意書を作成します。',
    icon: '🏢',
    color: '#0ea5e9',
    fields: [
      { id: 'business', label: '事業内容', type: 'textarea', placeholder: '例：ソフトウェア開発・SaaS提供', required: true },
      { id: 'members', label: 'メンバー数と名前', type: 'textarea', placeholder: '例：3名（田中太郎、山田花子、佐藤一郎）', required: true },
      { id: 'equity', label: '持株比率（出資比率）', type: 'textarea', placeholder: '例：田中50%、山田30%、佐藤20%', required: true },
      { id: 'manager', label: '業務執行社員（管理者）', type: 'text', placeholder: '例：田中太郎', required: true },
      { id: 'additionalInfo', label: 'その他の要望', type: 'textarea', placeholder: '例：議決権の配分、利益分配ルールなど', required: false },
    ],
  },
  {
    id: 'terms',
    name: '利用規約',
    description: 'Webサービス・アプリの利用規約を作成します。',
    icon: '📋',
    color: '#14b8a6',
    fields: [
      { id: 'product', label: '製品・サービス名と内容', type: 'textarea', placeholder: '例：クラウド会計ソフト「MoneyBook」', required: true },
      { id: 'pricing', label: '価格モデル', type: 'textarea', placeholder: '例：月額980円のサブスクリプション、年払いで10%割引', required: true },
      { id: 'userData', label: 'ユーザーデータ収集', type: 'textarea', placeholder: '例：メールアドレス、氏名、利用履歴を収集', required: true },
      { id: 'additionalInfo', label: 'その他の要望', type: 'textarea', placeholder: '例：禁止事項の追加、返金ポリシーの詳細など', required: false },
    ],
  },
  {
    id: 'privacy',
    name: 'プライバシーポリシー',
    description: '個人情報保護法に準拠したプライバシーポリシーを作成します。',
    icon: '🛡️',
    color: '#10b981',
    fields: [
      { id: 'service', label: 'サービス内容', type: 'textarea', placeholder: '例：ECサイト運営、オンライン学習プラットフォーム', required: true },
      { id: 'dataCollected', label: '収集するデータ', type: 'textarea', placeholder: '例：氏名、メールアドレス、決済情報、閲覧履歴、位置情報', required: true },
      { id: 'thirdParty', label: '利用している外部サービス', type: 'textarea', placeholder: '例：Google Analytics、Stripe決済、SendGrid', required: true },
      { id: 'userLocation', label: 'ユーザーの所在地', type: 'text', placeholder: '例：日本国内のみ / 日本およびアジア地域', required: true },
      { id: 'additionalInfo', label: 'その他の要望', type: 'textarea', placeholder: '例：Cookie使用の詳細、データ保持期間など', required: false },
    ],
  },
  {
    id: 'employment',
    name: '雇用契約・オファーレター',
    description: '採用時の雇用契約書・オファーレターを作成します。',
    icon: '📝',
    color: '#f59e0b',
    fields: [
      { id: 'position', label: '役職・職種', type: 'text', placeholder: '例：シニアソフトウェアエンジニア', required: true },
      { id: 'compensation', label: '報酬（年収・月給）', type: 'textarea', placeholder: '例：年収800万円（月給60万円＋賞与年2回）', required: true },
      { id: 'stockOptions', label: '株式・ストックオプションの有無', type: 'textarea', placeholder: '例：ストックオプション1000株、4年ベスティング', required: false },
      { id: 'location', label: '勤務地', type: 'text', placeholder: '例：東京都港区（リモートワーク可）', required: true },
      { id: 'conditions', label: '特別な条件・要望', type: 'textarea', placeholder: '例：競業避止期間1年、試用期間3ヶ月、退職金制度など', required: false },
    ],
  },
  {
    id: 'cofounder',
    name: '共同創業者契約',
    description: 'スタートアップの共同創業者間契約書を作成します。',
    icon: '🤝',
    color: '#ec4899',
    fields: [
      { id: 'business', label: '事業内容', type: 'textarea', placeholder: '例：AI搭載の教育プラットフォーム開発・運営', required: true },
      { id: 'founders', label: '創業者数と名前', type: 'textarea', placeholder: '例：2名（田中太郎：CEO、山田花子：CTO）', required: true },
      { id: 'equity', label: '株式比率', type: 'textarea', placeholder: '例：田中60%、山田40%', required: true },
      { id: 'roles', label: '各創業者の役割', type: 'textarea', placeholder: '例：田中：経営・資金調達、山田：技術・開発', required: true },
      { id: 'concerns', label: '構造上の懸念・特記事項', type: 'textarea', placeholder: '例：一方が退職した場合の株式買い取り条件、意思決定の方法など', required: false },
    ],
  },
  {
    id: 'cease-desist',
    name: '停止要求書',
    description: '権利侵害に対する停止要求書（内容証明）を作成します。',
    icon: '⚖️',
    color: '#ef4444',
    fields: [
      { id: 'rights', label: '侵害されている権利', type: 'textarea', placeholder: '例：当社の登録商標「○○」の無断使用', required: true },
      { id: 'infringement', label: '相手の侵害行為の詳細', type: 'textarea', placeholder: '例：競合A社がウェブサイト上で当社商標と酷似したロゴを使用', required: true },
      { id: 'desiredOutcome', label: '求める結果', type: 'textarea', placeholder: '例：ロゴの使用停止、ウェブサイトからの削除、今後の使用禁止', required: true },
      { id: 'additionalInfo', label: 'その他の情報', type: 'textarea', placeholder: '例：証拠となるスクリーンショットのURL、これまでの経緯など', required: false },
    ],
  },
  {
    id: 'payment-demand',
    name: '支払督促状',
    description: '未払い金の回収のための支払督促状を作成します。',
    icon: '💰',
    color: '#f97316',
    fields: [
      { id: 'debtor', label: '債務者情報', type: 'textarea', placeholder: '例：株式会社XYZ（東京都千代田区...）代表取締役 鈴木一郎', required: true },
      { id: 'amount', label: '請求金額', type: 'textarea', placeholder: '例：元本500万円、遅延利息年3%（30万円）、合計530万円', required: true },
      { id: 'basis', label: '支払いの根拠', type: 'textarea', placeholder: '例：2024年1月15日付業務委託契約書に基づくシステム開発費用', required: true },
      { id: 'efforts', label: 'これまでの回収努力', type: 'textarea', placeholder: '例：2024年3月・4月に電話で督促、5月にメールで請求書再送付', required: true },
      { id: 'additionalInfo', label: 'その他の要望', type: 'textarea', placeholder: '例：早期支払い割引の提示、分割払いの許容など', required: false },
    ],
  },
  {
    id: 'ip-protection',
    name: '知的財産保護プラン',
    description: '包括的な知的財産保護戦略を作成します。',
    icon: '💡',
    color: '#a855f7',
    fields: [
      { id: 'businessName', label: 'ビジネス名', type: 'text', placeholder: '例：株式会社テックイノベーション', required: true },
      { id: 'products', label: '製品・サービス', type: 'textarea', placeholder: '例：AIチャットボットプラットフォーム「BotMaster」', required: true },
      { id: 'logo', label: 'ロゴ・ブランド要素', type: 'textarea', placeholder: '例：「BotMaster」ロゴマーク、ブランドカラー #3B82F6', required: false },
      { id: 'processes', label: '独自プロセス・技術', type: 'textarea', placeholder: '例：独自の自然言語処理アルゴリズム、学習データ前処理手法', required: false },
      { id: 'existingRegistrations', label: '既存の登録情報', type: 'textarea', placeholder: '例：商標登録出願中（出願番号2024-XXXXX）', required: false },
    ],
  },
  {
    id: 'lease',
    name: '賃貸借契約書',
    description: '不動産の賃貸借契約書を作成します。',
    icon: '🏠',
    color: '#06b6d4',
    fields: [
      { id: 'role', label: '立場', type: 'radio', placeholder: '', required: true, options: [{ value: 'landlord', label: '家主（貸主）' }, { value: 'tenant', label: '借主' }] },
      { id: 'propertyType', label: '物件種別', type: 'select', placeholder: '', required: true, options: [{ value: 'apartment', label: 'マンション・アパート' }, { value: 'house', label: '一戸建て' }, { value: 'office', label: 'オフィス・事務所' }, { value: 'store', label: '店舗' }] },
      { id: 'duration', label: '賃貸期間', type: 'text', placeholder: '例：2年間（2024年4月1日〜2026年3月31日）', required: true },
      { id: 'rent', label: '月額賃料', type: 'text', placeholder: '例：月額15万円（管理費1万円別）', required: true },
      { id: 'specialConditions', label: '特別条件', type: 'textarea', placeholder: '例：ペット可、駐車場1台付き、原状回復義務の範囲など', required: false },
    ],
  },
  {
    id: 'will',
    name: '遺言書・遺産計画書',
    description: '遺言書の参考ドラフトを作成します。※法的効力のためには公正証書化が必要です。',
    icon: '📜',
    color: '#64748b',
    fields: [
      { id: 'testator', label: '遺言者情報', type: 'textarea', placeholder: '例：渡辺太郎（1960年1月1日生）、東京都新宿区...', required: true },
      { id: 'assets', label: '主な資産', type: 'textarea', placeholder: '例：自宅不動産（東京都新宿区...）、預金5000万円、株式（A社100株）', required: true },
      { id: 'heirs', label: '相続人の情報', type: 'textarea', placeholder: '例：配偶者（渡辺花子）、長男（渡辺一郎）、次男（渡辺二郎）', required: true },
      { id: 'distribution', label: '希望する分配', type: 'textarea', placeholder: '例：自宅は配偶者、預金は3等分、株式は長男', required: true },
      { id: 'additionalInfo', label: 'その他の要望', type: 'textarea', placeholder: '例：遺言執行者の指定、付言事項など', required: false },
    ],
  },
];

export function getDocumentTypeById(id: string): DocumentType | undefined {
  return documentTypes.find((doc) => doc.id === id);
}
