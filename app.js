/*
 * COACHING-L ポモドーロタイマー（MVP）
 * ビルド不要・外部ライブラリなし・外部通信なし。データは localStorage にのみ保存します。
 *
 * 構成（上から順に）
 *   1. 文言（STRINGS）
 *   2. 設定の既定値（DEFAULTS / loadConfig）
 *   3. 保存（Store）
 *   4. 時間の計算（Timer）
 *   5. チャイムと通知（Sound / Notify）
 *   6. 集計（日付の扱い・summarizeDay / summarizeRange / summarizeBands）
 *   7. 画面の描画（render* / showView）
 *   8. 画面遷移のアクション
 *   9. イベント登録と起動（restore）
 */
(function () {
  "use strict";

  // ==========================================================================
  // 1. 文言
  //    UI の文言はすべてここに置きます。中国語対応時は STRINGS.zh を足し、
  //    LANG を切り替えれば済むようにしています。
  // ==========================================================================

  const LANG = "ja";

  const STRINGS = {
    ja: {
      brand: "COACHING-L",
      docTitle: "ポモドーロタイマー | COACHING-L",
      docTitleFocus: "{time} 集中の時間 | COACHING-L",
      docTitlePaused: "{time} 一時停止中 | COACHING-L",
      docTitleBreak: "{time} 休憩 | COACHING-L",
      docTitleReview: "おつかれさまでした | COACHING-L",
      homeScreenTitle: "ポモドーロ", // iPhone のホーム画面に追加したときの名前

      // スタート
      appTitle: "ポモドーロタイマー",
      intentionLabel: "この時間で、何をする？",
      intentionPlaceholder: "例：企画書の見出しを決める",
      intentionHint: "空欄のままでも、はじめられます",
      workLabel: "作業時間",
      minutes: "{n}分",
      minuteUnit: "分",
      customChip: "その他",
      customAria: "作業時間（分）",
      customHint: "5〜60分で入力できます",
      customInvalid: "5〜60の数字を入れてください",
      breakSummary: "休憩は {n}分（設定で変えられます）",
      startButton: "はじめる",
      openLog: "記録",
      settingsTitle: "設定",
      breakLabel: "休憩時間",
      themeLabel: "表示",
      themeAuto: "自動",
      themeLight: "ライト",
      themeDark: "ダーク",
      themeHint: "「自動」は、スマホやパソコンの表示設定（ライト／ダーク）に合わせます。",
      breakHint: "1〜30分",
      screenLabel: "画面",
      keepScreenLabel: "タイマーの間は、画面をつけたままにする",
      keepScreenHint: "スマートフォンやタブレットでは、このページが画面に出ている間だけチャイムが鳴ります。オンにすると、タイマーの間は画面が自動で消えなくなります（電池を少し多く使います）。パソコンでオンにすると、画面オフや自動ロックも止まります。",
      keepScreenUnsupported: "このブラウザでは、画面をつけたままにする機能を使えません。チャイムを鳴らしたいときは、画面をつけたまま、このページを開いておいてください。",
      keepScreenInsecure: "画面をつけたままにする機能は、https で開いたページでだけ使えます。",
      touchHint: "画面を一度タップ（クリック）してください。終わったときにチャイムが鳴るように準備します。",
      notifyLabel: "終了のお知らせ",
      notifyButton: "終了時に通知する",
      notifyOn: "ブラウザの通知はオンです",
      notifyDenied: "通知はブラウザの設定でオフになっています",
      notifyUnsupported: "このブラウザでは通知を使えません",
      notifyTest: "テスト通知を送る（5秒後）",
      notifyTestSent: "5秒後に通知します。別のアプリに切り替えて、届くか確かめてください。",
      notifyTestTitle: "テスト通知",
      notifyTestBody: "通知は届いています。タイマーが終わったときも、このようにお知らせします。",
      notifyOsHint: "届かないときは、パソコン側の設定を確認してください。Mac は「システム設定 → 通知」で、使っているブラウザ（Google Chrome など）の「通知を許可」をオンにします。Windows は「設定 → システム → 通知」です。集中モードやおやすみモード（応答不可）の間は表示されません。",
      notifyBroken: "このブラウザでは、ページから通知を出せませんでした。",
      notifyNote: "スマートフォンやタブレットのブラウザでは、通知は届きません。このページを開いたままにしておくと、終わったときにチャイムが鳴ります。電源ボタンで画面を消したとき、別のアプリに切り替えたとき、iPhone・iPad のマナーモードのときは鳴りません。",
      breakEndedNotice: "休憩の時間が終わりました。次の時間も、自分のペースでどうぞ",
      storageUnavailable: "この環境では記録を保存できません（タイマーは使えます）",

      // 集中中
      focusHeading: "集中の時間",
      pause: "一時停止",
      resume: "再開する",
      pausedNote: "一時停止中",
      stop: "やめる",

      // やめたあと
      stoppedMessage: "ここまでの時間も、ちゃんと記録しました。\nまた始めたくなったら、いつでもどうぞ",
      stoppedDetail: "今回の時間：{duration}",
      backToStart: "スタートにもどる",

      // 振り返り
      reviewTitle: "おつかれさまでした",
      reviewIntention: "「{text}」の時間でした",
      finishedWhileAway: "タイマーは {time} に終わっていました",
      focusQuestion: "集中度は？",
      focusLow: "散りがち",
      focusHigh: "没頭できた",
      feelingQuestion: "いまの気分は？",
      reviewSkipHint: "どちらも、選ばなくてだいじょうぶです",
      toBreak: "休憩へ",

      // 休憩
      breakTitle: "休憩",
      endBreak: "スタートにもどる",

      // 記録（日ごと・週ごと）
      logTitle: "記録",
      logTabsLabel: "記録の表示",
      tabDay: "日ごと",
      tabWeek: "週ごと",
      countUnit: "{n}回",
      prevDay: "‹ 前の日",
      nextDay: "次の日 ›",
      prevWeek: "‹ 前の週",
      nextWeek: "次の週 ›",
      toToday: "今日へ",
      toThisWeek: "今週へ",
      dayToday: "今日",
      dayYesterday: "昨日",
      dayBefore: "おととい",
      weekdays: ["日", "月", "火", "水", "木", "金", "土"],
      dateLabel: "{m}月{d}日（{w}）",
      dateLabelYear: "{y}年{m}月{d}日（{w}）",
      relativeDate: "{rel} {date}",
      weekRange: "{from}〜{to}",
      daySummary: "{count}回・{duration}、集中の時間をとりました",
      dayNoRecord: "この日の記録はありません",
      resumedLine: "中断のあと、また始められた：{n}回",
      noteTitle: "この日のふりかえり（書かなくてもだいじょうぶです）",
      noteGood: "よかったこと",
      noteNext: "次に試したいこと",
      noteMoved: "気持ちが動いたこと（よいことでも、そうでなくても）",
      noteSaved: "保存しました",
      copyDay: "この日をコピー",
      copied: "コピーしました。LINE などに貼り付けられます",
      copyFallbackHint: "下の文章を長押し（または選択）してコピーしてください",
      weekSummary: "この週は{count}回・{duration}、集中の時間をとりました。",
      weekResumed: "中断のあと、また始められたのは{n}回でした。",
      weekNoRecord: "この週の記録はありません。",
      focusBreakdown: "集中度の内訳：{list}",
      focusItem: "{level}が{n}回",
      focusUnrated: "（未記入{n}回）",
      feelingBreakdown: "気分：{list}",
      feelingItem: "{label}{n}回",
      listSep: "・",
      totalSinceStart: "はじめてからの合計：{count}回・{duration}",
      chartDailyTitle: "日ごとの集中の時間",
      chartBandsTitle: "集中しやすい時間帯（ここ4週間）",
      legendFocus: "濃さは集中度（散りがち 1 → 5 没頭できた）。灰色は未記入",
      minutesShort: "{n}分",
      dayRow: "{date}　{count}回・{minutes}分",
      dayRowEmpty: "{date}　—",
      bandsNotEnough: "記録がたまると、ここに集中しやすい時間帯が見えてきます",
      bandsFew: "記録がまだ少ない",
      bandsObserve: "ここ4週間では、{bands}でした",
      bandsObserveItem: "{band}は{total}回のうち{high}回が集中度4〜5",
      bandsObserveJoin: "、",
      bandsMost: "ここ4週間は、{band}に始めた回がいちばん多くありました（{n}回）",
      bandLabels: ["早朝（5〜8時）", "午前（8〜12時）", "昼（12〜14時）", "午後（14〜18時）", "夕方〜夜（18〜22時）", "深夜（22〜5時）"],
      showNumbers: "数字で見る",
      tableBand: "時間帯",
      tableCount: "回数",
      tableUnrated: "未記入",
      flowTitle: "没頭できた時間",
      flowMeta: "{date} {time}・{minutes}分",
      weekNotesTitle: "この週のふりかえり",
      questionsTitle: "ふりかえりの問い",
      questionUse: "この週、時間をうまく使えたと感じる場面は？",
      questionPlace: "来週、大切なこと（急ぎではないけれど大事なこと）を、どの時間帯に置いてみますか？",
      questionsHint: "答えは書かなくてだいじょうぶです。思い浮かべるだけでも。",
      downloadTitle: "記録のダウンロード",
      downloadCsv: "表計算ソフト用（CSV）",
      downloadJson: "すべてのデータ（JSON）",
      downloadNote: "ファイルはこの端末に保存されます。アプリから外部へ送信することはありません。やることやふりかえりの文章も入るので、渡す相手はご自身で選んでください。",
      downloadTrouble: "うまくダウンロードできないとき（LINE の中で開いたときなど）は、Safari や Chrome で開き直すか、日ごとの「この日をコピー」を使ってください。",
      downloaded: "ダウンロードしました：{name}",
      csvHeaders: ["日付", "曜日", "開始", "終了", "やること", "区切り", "集中した時間（分）", "予定（分）", "集中度", "気分", "記録ID"],
      copyHeader: "【{date}の記録】",
      copyFocus: "集中度{n}",
      copyInterrupted: "（中断）",
      copyNoteGood: "よかったこと",
      copyNoteNext: "次に試したいこと",
      copyNoteMoved: "気持ちが動いたこと",
      logDuration: "時間",
      logPlanned: "（予定 {n}分）",
      logFocus: "集中度",
      logFeeling: "気分",
      statusCompleted: "完了",
      statusInterrupted: "中断",
      noIntention: "（宣言なし）",
      none: "—",
      lessThanMinute: "1分未満",
      hoursMinutes: "{h}時間{m}分",
      back: "もどる",
      clearAll: "すべての記録を消す",
      clearConfirm: "すべての記録とふりかえりを消します。元には戻せません。先に「記録のダウンロード」で保存しておくこともできます。よろしいですか？",
      cleared: "記録を消しました",

      // 通知
      notifyFocusTitle: "おつかれさまでした",
      notifyFocusBody: "集中の時間が終わりました。ひと息つきましょう",
      notifyBreakTitle: "休憩が終わりました",
      notifyBreakBody: "次の時間も、自分のペースでどうぞ",

      // フッター
      privacyNote: "記録はこの端末の中だけに保存され、外部には送信されません",

      // 気分（保存するのはキー。表示名はここから引きます）
      feelings: {
        refreshed: "すっきり",
        fulfilled: "充実",
        neutral: "ふつう",
        tired: "疲れた",
        foggy: "もやもや",
        rushed: "あせり",
      },

      // 休憩中の促し（全部を一巡するまで同じ文が出ないように、1つずつ表示）
      // 並び順は表示に影響しません。文を足すときは末尾に追加してください。
      breakPrompts: [
        "立ち上がって、ぐーっと伸びをしてみましょう",
        "水を一杯、ゆっくり飲みましょう",
        "目を閉じて、3回ゆっくり呼吸しましょう",
        "窓の外の、遠くを眺めてみましょう",
        "肩を、ゆっくり回してみましょう",
        // 身体をほぐす
        "頭をゆっくり横にかたむけて、首すじを伸ばしましょう",
        "両手を後ろで組んで、胸をひらいてみましょう",
        "両腕を前にのばして、背中を丸めてみましょう",
        "上半身を、左右にゆっくりひねってみましょう",
        "手首を、ぶらぶらと軽く振ってみましょう",
        "指を大きく開いて、ゆっくりグーに握りましょう",
        "座ったまま、つま先でゆっくり円を描いてみましょう",
        "奥歯をそっと離して、あごの力を抜きましょう",
        // 感覚を休める
        "手のひらをこすって温め、まぶたにそっと当てましょう",
        "聞こえる音を、ひとつずつ数えてみましょう",
        "足の裏が床にふれる感じに、意識を向けましょう",
        // 気分を切り替える
        "スマホを置いて、ぼんやりする時間にしましょう",
        "席を離れて、少しだけ歩いてみましょう",
        "手をゆっくり洗って、ひと区切りつけましょう",
        "お手洗いに行くなら、いまがちょうどいい時間です",
      ],
    },
  };

  function dict() {
    return STRINGS[LANG] || STRINGS.ja;
  }

  /** 文言を取り出す。{name} を vars の値で置き換える */
  function t(key, vars) {
    const d = dict();
    let s = key in d ? d[key] : STRINGS.ja[key];
    if (s === undefined) return key;
    if (typeof s === "string" && vars) {
      s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    }
    return s;
  }

  /** data-i18n 系の属性を持つ要素に文言を流し込む */
  function applyI18n(root) {
    document.documentElement.lang = LANG;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
    });
    root.querySelectorAll("[data-i18n-content]").forEach((el) => {
      el.setAttribute("content", t(el.dataset.i18nContent));
    });
  }

  // ==========================================================================
  // 2. 設定の既定値
  //    将来の「URL パラメータでの設定」は loadConfig() で既定値を上書きする形で足せます。
  // ==========================================================================

  const STORAGE_KEY = "coachingl-pomodoro-v1";
  const SCHEMA_VERSION = 1;

  const DEFAULTS = Object.freeze({
    workMinutes: 15,
    breakMinutes: 5,
    workPresets: [10, 15, 25],
    workMin: 5,
    workMax: 60,
    breakMin: 1,
    breakMax: 30,
    feelings: ["refreshed", "fulfilled", "neutral", "tired", "foggy", "rushed"],
    // 記録とふりかえり
    weekStartsOn: 1, // 月曜はじまり
    // 時間帯の区切り（始めた時刻で分ける）。[開始, 終了) の時。最後は日をまたぐ
    timeBands: [
      [5, 8],
      [8, 12],
      [12, 14],
      [14, 18],
      [18, 22],
      [22, 5],
    ],
    trendWindowDays: 28, // 「集中しやすい時間帯」を数える日数
    trendMinRated: 10, // 集中度つきの記録がこの回数たまるまでは図を出さない
    trendMinDays: 3, // …かつ、この日数分
    bandMinCount: 3, // これ未満の時間帯は薄く描く
    flowFocusLevels: [5], // 「没頭できた時間」に載せる集中度
    flowMax: 5,
    noteMaxLength: 200,
  });

  function loadConfig() {
    return Object.assign({}, DEFAULTS);
  }

  const CONFIG = loadConfig();

  // ==========================================================================
  // 3. 保存
  //    1つのキーに { version, settings, sessions, current } を JSON で保存します。
  // ==========================================================================

  const Store = (function () {
    let state = blank();
    let available = true;

    function blank() {
      return {
        version: SCHEMA_VERSION,
        // keepScreenOn は未設定にしておき、端末の種類で決める（keepScreenOn() を参照）
        settings: { workMinutes: CONFIG.workMinutes, breakMinutes: CONFIG.breakMinutes },
        sessions: [],
        current: null,
        // 休憩の促しの「山札」。remaining が空になったら切り直す
        promptDeck: { remaining: [], last: null },
      };
    }

    /**
     * 保存データを現在の形式にそろえる（形式を変えるときはここに移行処理を足す）。
     * 知らない項目は捨てずに残す（新しい版で足した項目を、古い版で消してしまわないように）。
     */
    function migrate(data) {
      const base = blank();
      if (!data || typeof data !== "object") return base;
      return Object.assign({}, data, {
        version: SCHEMA_VERSION,
        settings: Object.assign(base.settings, isObject(data.settings) ? data.settings : {}),
        sessions: Array.isArray(data.sessions) ? data.sessions.filter(isObject) : [],
        current: isObject(data.current) ? data.current : null,
        promptDeck: isObject(data.promptDeck)
          ? {
              remaining: Array.isArray(data.promptDeck.remaining) ? data.promptDeck.remaining : [],
              last: Number.isInteger(data.promptDeck.last) ? data.promptDeck.last : null,
            }
          : base.promptDeck,
      });
    }

    function load() {
      let raw = null;
      try {
        raw = window.localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        available = false;
      }
      let data = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = null;
        }
      }
      state = migrate(data);
      return state;
    }

    function save() {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        available = true;
      } catch (e) {
        available = false;
      }
    }

    return {
      load,
      get state() {
        return state;
      },
      get available() {
        return available;
      },
      setCurrent(current) {
        state.current = current;
        save();
      },
      updateCurrent(patch) {
        if (!state.current) return;
        state.current = Object.assign({}, state.current, patch);
        save();
      },
      updateSettings(patch) {
        state.settings = Object.assign({}, state.settings, patch);
        save();
      },
      /** 同じ id があれば上書き、なければ追加（複数タブでの二重記録を防ぐ） */
      upsertSession(session) {
        const i = state.sessions.findIndex((s) => s.id === session.id);
        if (i >= 0) state.sessions[i] = Object.assign({}, state.sessions[i], session);
        else state.sessions.push(session);
        save();
      },
      updateSession(id, patch) {
        const i = state.sessions.findIndex((s) => s.id === id);
        if (i < 0) return;
        state.sessions[i] = Object.assign({}, state.sessions[i], patch);
        save();
      },
      clearSessions() {
        state.sessions = [];
        save();
      },
      setPromptDeck(remaining, last) {
        state.promptDeck = { remaining, last };
        save();
      },
    };
  })();

  /**
   * 一日のふりかえり。本体とは別のキーに保存する
   * （開いたままの古い版のタブが本体を保存し直しても、ふりかえりが消えないように）。
   * 形：{ version: 1, days: { "YYYY-MM-DD": { good, next, moved, updatedAt } } }
   */
  const NOTES_KEY = "coachingl-pomodoro-notes-v1";
  const NOTE_FIELDS = ["good", "next", "moved"];

  const Notes = (function () {
    let days = {};

    function load() {
      days = {};
      try {
        const data = JSON.parse(window.localStorage.getItem(NOTES_KEY) || "null");
        if (isObject(data) && isObject(data.days)) {
          Object.keys(data.days).forEach((key) => {
            const d = data.days[key];
            if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !isObject(d)) return;
            const clean = {};
            NOTE_FIELDS.forEach((f) => {
              if (typeof d[f] === "string" && d[f]) clean[f] = d[f].slice(0, CONFIG.noteMaxLength);
            });
            if (Object.keys(clean).length) {
              clean.updatedAt = Number(d.updatedAt) || 0;
              days[key] = clean;
            }
          });
        }
      } catch (e) {
        days = {};
      }
    }

    function save() {
      try {
        window.localStorage.setItem(NOTES_KEY, JSON.stringify({ version: 1, days }));
      } catch (e) {
        /* 保存できなくても画面は続ける */
      }
    }

    return {
      load,
      get(key) {
        return days[key] || null;
      },
      all() {
        return days;
      },
      set(key, field, value) {
        const text = String(value || "").slice(0, CONFIG.noteMaxLength);
        const d = Object.assign({}, days[key]);
        if (text.trim()) d[field] = text;
        else delete d[field];
        const has = NOTE_FIELDS.some((f) => d[f]);
        if (has) {
          d.updatedAt = Date.now();
          days[key] = d;
        } else {
          delete days[key];
        }
        save();
      },
      clear() {
        days = {};
        try {
          window.localStorage.removeItem(NOTES_KEY);
        } catch (e) {
          /* 何もしない */
        }
      },
    };
  })();

  function isObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function newId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  /**
   * 休憩の促しを「山札」から1枚引く。
   * トランプのように切った順に出すので、全部を一巡するまで同じ文は出ない。
   * 切り直した直後に、前回と同じ文が続かないようにもしている。
   */
  function drawPromptIndex(count) {
    const deck = Store.state.promptDeck;
    let remaining = deck.remaining.filter((i) => Number.isInteger(i) && i >= 0 && i < count);
    if (remaining.length === 0) {
      remaining = shuffle(Array.from({ length: count }, (_, i) => i));
      if (remaining.length > 1 && remaining[0] === deck.last) {
        remaining.push(remaining.shift());
      }
    }
    const index = remaining.shift();
    Store.setPromptDeck(remaining, index);
    return index;
  }

  // ==========================================================================
  // 3.5 表示テーマ（自動／ライト／ダーク）
  //     html 要素の data-theme で切り替える。「自動」のときは属性を付けず、端末の設定に合わせる。
  // ==========================================================================

  const THEMES = ["auto", "light", "dark"];
  const THEME_COLORS = { light: "#f7f8fa", dark: "#02172f" }; // ブラウザ上部の帯の色（style.css の --bg と同じ）

  function normalizeTheme(v) {
    return THEMES.indexOf(v) >= 0 ? v : "auto";
  }

  function applyTheme(value) {
    const theme = normalizeTheme(value);
    const root = document.documentElement;
    if (theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      const forDark = /dark/.test(m.getAttribute("media") || "");
      const scheme = theme === "auto" ? (forDark ? "dark" : "light") : theme;
      m.setAttribute("content", THEME_COLORS[scheme]);
    });
  }

  // 画面がちらつかないよう、読み込みの最初（画面を描く前）に保存済みのテーマだけ反映しておく
  (function applySavedThemeEarly() {
    try {
      const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      applyTheme(data && data.settings && data.settings.theme);
    } catch (e) {
      /* 保存を読めなくても、端末の設定どおりに表示される */
    }
  })();

  // ==========================================================================
  // 4. 時間の計算
  //    「終了予定時刻（endAt）」だけを保存し、表示のたびに現在時刻との差を計算します。
  //    一時停止中は endAt を null にして、残り時間（remainingMs）を保存します。
  // ==========================================================================

  const Timer = {
    remainingMs(current, now) {
      if (!current) return 0;
      if (current.endAt == null) return Math.max(0, Number(current.remainingMs) || 0);
      return Math.max(0, current.endAt - now);
    },
    isRunning(current) {
      return !!current && current.endAt != null;
    },
    formatClock(ms) {
      const total = Math.ceil(ms / 1000);
      const m = Math.floor(total / 60);
      const s = total % 60;
      return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    },
  };

  function formatDuration(seconds) {
    const s = Math.max(0, Math.round(seconds));
    if (s > 0 && s < 60) return t("lessThanMinute");
    const totalMinutes = Math.floor(s / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? t("hoursMinutes", { h, m }) : t("minutes", { n: m });
  }

  /** 1回分の時間。短くても「0分」ではなく「1分未満」と表示する */
  function formatSessionDuration(seconds) {
    return seconds < 60 ? t("lessThanMinute") : formatDuration(seconds);
  }

  function formatTimeOfDay(ts) {
    const d = new Date(ts);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  // 表示更新の予約。表示用（秒の境目ごと）と終了検知用（終了時刻に1回）の2本。
  let tickTimer = null;
  let endTimer = null;

  function stopTicking() {
    clearTimeout(tickTimer);
    clearTimeout(endTimer);
    tickTimer = null;
    endTimer = null;
  }

  function startTicking() {
    stopTicking();
    const cur = Store.state.current;
    if (!Timer.isRunning(cur)) {
      renderClock(Date.now());
      return;
    }
    endTimer = setTimeout(tick, Math.max(0, cur.endAt - Date.now()));
    tick();
  }

  function tick() {
    clearTimeout(tickTimer);
    tickTimer = null;
    const cur = Store.state.current;
    if (!Timer.isRunning(cur)) return;
    const now = Date.now();
    if (now >= cur.endAt) {
      onPhaseEnd(false);
      return;
    }
    renderClock(now);
    // 表示上の秒が次に変わる瞬間（＋少しの余裕）に合わせて呼び直す
    const untilNextSecond = (cur.endAt - now) % 1000 || 1000;
    tickTimer = setTimeout(tick, untilNextSecond + 15);
  }

  // ==========================================================================
  // 5. チャイムと通知
  // ==========================================================================

  const Sound = (function () {
    let ctx = null;

    function getContext() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
        ctx.addEventListener("statechange", () => renderTouchHint());
      } catch (e) {
        ctx = null;
      }
      return ctx;
    }

    function supported() {
      return !!(window.AudioContext || window.webkitAudioContext);
    }

    /** チャイムをすぐ鳴らせる状態か（音を使えない環境では、待っても変わらないので true） */
    function ready() {
      return !supported() || (!!ctx && ctx.state === "running");
    }

    /**
     * ユーザー操作の中で呼び、自動再生の制限を解除しておく。
     * iPhone では画面ロックなどのあと "interrupted" になるので、"running" 以外なら再開を試みる。
     */
    function unlock() {
      const c = getContext();
      if (!c || c.state === "running") return;
      c.resume().catch(() => {});
      // iOS Safari 向け：無音を一瞬鳴らして再生可能な状態にする
      try {
        const src = c.createBufferSource();
        src.buffer = c.createBuffer(1, 1, 22050);
        src.connect(c.destination);
        src.start(0);
      } catch (e) {
        /* 何もしない */
      }
    }

    /** やわらかい2音のチャイム（サイン波＋弱い倍音、ゆっくり減衰） */
    function play(c) {
      try {
        const start = c.currentTime + 0.05;
        const master = c.createGain();
        master.gain.value = 0.2;
        master.connect(c.destination);
        const notes = [
          { freq: 659.25, at: 0 }, // E5
          { freq: 880.0, at: 0.32 }, // A5
        ];
        notes.forEach((note) => {
          const t0 = start + note.at;
          [
            { mult: 1, level: 1 },
            { mult: 2, level: 0.12 },
          ].forEach((partial) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = "sine";
            osc.frequency.value = note.freq * partial.mult;
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(partial.level, t0 + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
            osc.connect(gain);
            gain.connect(master);
            osc.start(t0);
            osc.stop(t0 + 1.5);
          });
        });
      } catch (e) {
        /* 音が鳴らなくてもタイマーは続ける */
      }
    }

    /**
     * チャイムを鳴らす。音を出せる状態でなければ少しだけ待つ（タブに戻った直後など）。
     * 待っても鳴らせないときは諦める。次に画面に触れたときに遅れて鳴るのを防ぐため。
     */
    function chime() {
      const c = getContext();
      if (!c) return;
      if (c.state === "running") {
        play(c);
        return;
      }
      let timer = null;
      const onChange = () => {
        if (c.state !== "running") return;
        cleanup();
        play(c);
      };
      const cleanup = () => {
        c.removeEventListener("statechange", onChange);
        clearTimeout(timer);
      };
      c.addEventListener("statechange", onChange);
      timer = setTimeout(cleanup, 1500);
      c.resume().catch(() => {});
    }

    return { unlock, chime, ready };
  })();

  /**
   * タイマーの間、画面が自動で消えないようにする（Screen Wake Lock）。
   * スマートフォンは画面が消えるとページの動きが止まり、チャイムが鳴らないため。
   * ページが隠れると自動で解除されるので、表示に戻ったら取り直す。
   */
  const ScreenLock = (function () {
    let sentinel = null;
    let pending = false;
    let retry = false;
    let blocked = false; // 直近の取得が断られた（画面に触れると取り直す）

    function supported() {
      return "wakeLock" in navigator;
    }

    function held() {
      return !!sentinel && !sentinel.released;
    }

    function acquire() {
      if (!supported() || document.hidden || held()) return;
      if (pending) {
        // 取得中に操作があったら、断られたときにもう一度だけ試す
        retry = true;
        return;
      }
      pending = true;
      retry = false;
      navigator.wakeLock
        .request("screen")
        .then((s) => {
          sentinel = s;
          blocked = false;
          s.addEventListener("release", () => {
            if (sentinel === s) sentinel = null;
            renderTouchHint();
          });
          // 取得を待つ間に不要になっていたら、すぐ手放す
          if (!wanted()) release();
        })
        .catch(() => {
          // 再読み込み直後（まだ画面に触れていない）や、電池残量が少ないときなどに断られる
          if (!document.hidden) blocked = true;
        })
        .then(() => {
          const again = retry;
          retry = false;
          pending = false;
          if (again && wanted()) acquire();
          renderTouchHint();
        });
    }

    function release() {
      blocked = false;
      if (!sentinel) return;
      const s = sentinel;
      sentinel = null;
      s.release().catch(() => {});
    }

    return {
      supported,
      held,
      acquire,
      release,
      isBlocked() {
        return blocked;
      },
    };
  })();

  /** 画面をつけたままにするか。未設定なら、タッチ操作の端末（スマホ・タブレット）だけオン */
  function keepScreenOn() {
    const v = Store.state.settings.keepScreenOn;
    if (typeof v === "boolean") return v;
    return !!(window.matchMedia && window.matchMedia("(any-pointer: coarse)").matches);
  }

  /** 動いているタイマーがあり、設定がオンのときだけ画面をつけたままにする */
  function wanted() {
    const cur = Store.state.current;
    return (
      keepScreenOn() &&
      Timer.isRunning(cur) &&
      (cur.phase === "focus" || cur.phase === "break")
    );
  }

  function syncScreenLock() {
    if (wanted()) ScreenLock.acquire();
    else ScreenLock.release();
    renderTouchHint();
  }

  /**
   * 再読み込みで進行中のタイマーを復元したときは、画面に一度触れるまで
   * チャイムを鳴らせず、画面ロック防止も効かないことがある。そのときだけ案内を出す。
   */
  let touchHintArmed = false;

  function needsTouch() {
    const cur = Store.state.current;
    if (!Timer.isRunning(cur) || (cur.phase !== "focus" && cur.phase !== "break")) return false;
    const screenBlocked = wanted() && !ScreenLock.held() && ScreenLock.isBlocked();
    return screenBlocked || !Sound.ready();
  }

  function renderTouchHint() {
    if (!el.touchHint) return;
    if (touchHintArmed && !needsTouch()) touchHintArmed = false;
    el.touchHint.hidden = !touchHintArmed;
  }

  // スマートフォン・タブレットのブラウザは、ページから通知を出せない（Android Chrome は例外になる）
  const IS_MOBILE =
    !!(navigator.userAgentData && navigator.userAgentData.mobile) ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");

  const Notify = {
    last: null,
    broken: false, // 実際に出そうとして例外になった
    channel: null,
    /** ほかのタブと「通知を片付けて」を伝え合う */
    init() {
      if (!("BroadcastChannel" in window)) return;
      try {
        this.channel = new BroadcastChannel(STORAGE_KEY);
        this.channel.onmessage = (e) => {
          if (e.data === "close-notifications") this.closeLast();
        };
      } catch (e) {
        this.channel = null;
      }
    },
    supported() {
      return "Notification" in window && !IS_MOBILE && !this.broken;
    },
    permission() {
      return this.supported() ? window.Notification.permission : "unsupported";
    },
    request() {
      if (!this.supported()) return Promise.resolve("unsupported");
      return new Promise((resolve) => {
        try {
          const p = window.Notification.requestPermission(resolve);
          if (p && typeof p.then === "function") p.then(resolve, () => resolve(this.permission()));
        } catch (e) {
          resolve(this.permission());
        }
      });
    },
    /**
     * 通知を出す。出せたら true。
     * tag は終了ごとに変える（例：終了時刻つき）。同じ tag を使い回すと、前の通知が通知センターに
     * 残っているとき Chrome / Edge が新しい通知をバナーを出さずに差し替えてしまうため。
     * 一方で、同じ終了を複数のタブが知らせるときは同じ tag になり、通知は1件にまとまる。
     */
    show(title, body, tag) {
      if (this.permission() !== "granted") return false;
      this.closeLast();
      try {
        const n = new window.Notification(title, tag ? { body, tag } : { body });
        n.onclick = () => {
          window.focus();
          n.close();
        };
        this.last = n;
        return true;
      } catch (e) {
        // Android Chrome などは new Notification に対応していない
        this.broken = true;
        return false;
      }
    },
    /** 前の通知を片付ける（次の通知を出す前） */
    closeLast() {
      if (!this.last) return;
      try {
        this.last.close();
      } catch (e) {
        /* 何もしない */
      }
      this.last = null;
    },
    /** ページに戻ってきたので、どのタブが出した通知も片付ける */
    closeEverywhere() {
      this.closeLast();
      if (!this.channel) return;
      try {
        this.channel.postMessage("close-notifications");
      } catch (e) {
        /* 何もしない */
      }
    },
  };

  // ==========================================================================
  // 6. 集計
  //    「一日のまとめのコピー」など、今後の機能でも使い回せるよう画面から切り離しています。
  // ==========================================================================

  // ---- 日付（端末のローカル時刻。一日の区切りは0時） ----

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  /** 時刻や Date を "YYYY-MM-DD" に */
  function dateKey(t) {
    const d = t instanceof Date ? t : new Date(t);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  /** "YYYY-MM-DD" をその日の0時の Date に */
  function keyToDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(key, n) {
    const d = keyToDate(key);
    d.setDate(d.getDate() + n);
    return dateKey(d);
  }

  /** その日を含む週のはじめ（CONFIG.weekStartsOn。月曜はじまり） */
  function weekStartKey(key) {
    const d = keyToDate(key);
    const diff = (d.getDay() - CONFIG.weekStartsOn + 7) % 7;
    return addDays(key, -diff);
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function formatDateLabel(key) {
    const d = keyToDate(key);
    const vars = { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), w: t("weekdays")[d.getDay()] };
    return d.getFullYear() === new Date().getFullYear() ? t("dateLabel", vars) : t("dateLabelYear", vars);
  }

  /** 「今日 10月6日（火）」「昨日 …」「おととい …」、それより前は日付だけ */
  function formatDayTitle(key) {
    const today = todayKey();
    const rel =
      key === today ? t("dayToday") : key === addDays(today, -1) ? t("dayYesterday") : key === addDays(today, -2) ? t("dayBefore") : "";
    return rel ? t("relativeDate", { rel, date: formatDateLabel(key) }) : formatDateLabel(key);
  }

  function formatDateCsv(ts) {
    const d = new Date(ts);
    return d.getFullYear() + "/" + pad2(d.getMonth() + 1) + "/" + pad2(d.getDate());
  }

  // ---- 集計（画面・ファイル・コピーで同じものを使う） ----

  function sessionSeconds(s) {
    if (typeof s.focusedSeconds === "number") return s.focusedSeconds;
    if (s.status === "completed") return (Number(s.plannedMinutes) || 0) * 60;
    return Math.max(0, Math.round(((s.endedAt || 0) - (s.startedAt || 0)) / 1000));
  }

  function validSessions() {
    return Store.state.sessions
      .filter((s) => typeof s.startedAt === "number")
      .slice()
      .sort((a, b) => a.startedAt - b.startedAt);
  }

  /** いちばん古い記録の日（記録がなければ今日） */
  function earliestKey() {
    const list = validSessions();
    return list.length ? dateKey(list[0].startedAt) : todayKey();
  }

  /** 同じ日に、中断した回のあとに別の回を始めた数（中断1つにつき1） */
  function countResumed(daySessions) {
    let n = 0;
    daySessions.forEach((s, i) => {
      if (s.status === "interrupted" && i < daySessions.length - 1) n++;
    });
    return n;
  }

  /** 期間（from〜to の日付キー、両端を含む）の集計 */
  function summarizeRange(fromKey, toKey) {
    const list = validSessions().filter((s) => {
      const k = dateKey(s.startedAt);
      return k >= fromKey && k <= toKey;
    });
    const byDay = {};
    list.forEach((s) => {
      const k = dateKey(s.startedAt);
      (byDay[k] = byDay[k] || []).push(s);
    });
    const focusCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, none: 0 };
    const feelingCounts = {};
    list.forEach((s) => {
      if (s.focus >= 1 && s.focus <= 5) focusCounts[s.focus]++;
      else focusCounts.none++;
      if (s.feeling) feelingCounts[s.feeling] = (feelingCounts[s.feeling] || 0) + 1;
    });
    return {
      sessions: list,
      byDay,
      count: list.length,
      totalSeconds: list.reduce((sum, s) => sum + sessionSeconds(s), 0),
      resumed: Object.keys(byDay).reduce((sum, k) => sum + countResumed(byDay[k]), 0),
      focusCounts,
      feelingCounts,
    };
  }

  function summarizeDay(key) {
    const r = summarizeRange(key, key);
    return { sessions: r.sessions, count: r.count, totalSeconds: r.totalSeconds, resumed: r.resumed };
  }

  function summarizeAll() {
    const list = validSessions();
    return { count: list.length, totalSeconds: list.reduce((sum, s) => sum + sessionSeconds(s), 0) };
  }

  /** 始めた時刻から時間帯の番号を返す（CONFIG.timeBands） */
  function bandIndex(ts) {
    const h = new Date(ts).getHours();
    return CONFIG.timeBands.findIndex(([from, to]) => (from < to ? h >= from && h < to : h >= from || h < to));
  }

  /** 「集中しやすい時間帯」：endKey までの CONFIG.trendWindowDays 日分 */
  function summarizeBands(endKey) {
    const fromKey = addDays(endKey, -(CONFIG.trendWindowDays - 1));
    const list = summarizeRange(fromKey, endKey).sessions;
    const bands = CONFIG.timeBands.map(() => ({ total: 0, levels: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, none: 0 } }));
    const ratedDays = new Set();
    let rated = 0;
    list.forEach((s) => {
      const b = bands[bandIndex(s.startedAt)];
      if (!b) return;
      b.total++;
      if (s.focus >= 1 && s.focus <= 5) {
        b.levels[s.focus]++;
        rated++;
        ratedDays.add(dateKey(s.startedAt));
      } else {
        b.levels.none++;
      }
    });
    return { bands, rated, ratedDays: ratedDays.size, enough: rated >= CONFIG.trendMinRated && ratedDays.size >= CONFIG.trendMinDays };
  }

  // ==========================================================================
  // 7. 画面の描画
  // ==========================================================================

  const $ = (sel) => document.querySelector(sel);

  const el = {};
  let currentView = null;
  let selectedWork = CONFIG.workMinutes; // 数値、または "custom"

  function cacheElements() {
    el.views = Array.from(document.querySelectorAll("[data-view]"));
    el.startNotice = $("#start-notice");
    el.storageNotice = $("#storage-notice");
    el.startForm = $("#start-form");
    el.intention = $("#intention");
    el.workChips = Array.from(document.querySelectorAll("[data-work]"));
    el.customRow = $("#custom-row");
    el.workCustom = $("#work-custom");
    el.customHint = $("#custom-hint");
    el.breakSummary = $("#break-summary");
    el.breakMinutes = $("#break-minutes");
    el.notifyBtn = $("#notify-btn");
    el.notifyStatus = $("#notify-status");
    el.notifyTestBtn = $("#notify-test-btn");
    el.notifyTestStatus = $("#notify-test-status");
    el.notifyOsHint = $("#notify-os-hint");
    el.keepScreen = $("#keep-screen");
    el.keepScreenRow = $("#keep-screen-row");
    el.keepScreenHint = $("#keep-screen-hint");
    el.reviewNotice = $("#review-notice");
    el.notifyNote = $("#notify-note");
    el.touchHint = $("#touch-hint");
    el.focusView = $('[data-view="focus"]');
    el.focusTime = $("#focus-time");
    el.focusIntention = $("#focus-intention");
    el.pausedNote = $("#paused-note");
    el.pauseBtn = $("#pause-btn");
    el.stoppedDetail = $("#stopped-detail");
    el.reviewIntention = $("#review-intention");
    el.focusChips = Array.from(document.querySelectorAll("[data-focus]"));
    el.feelingChips = $("#feeling-chips");
    el.breakTime = $("#break-time");
    el.breakPrompt = $("#break-prompt");
    el.logList = $("#log-list");
    el.logStatus = $("#log-status");
    el.clearBtn = $("#clear-btn");
    el.tabDay = $("#tab-day");
    el.tabWeek = $("#tab-week");
    el.panelDay = $("#panel-day");
    el.panelWeek = $("#panel-week");
    el.dayTitle = $("#day-title");
    el.dayPrev = $("#day-prev");
    el.dayNext = $("#day-next");
    el.dayToday = $("#day-today");
    el.daySummary = $("#day-summary");
    el.dayResumed = $("#day-resumed");
    el.noteBox = $("#note-box");
    el.noteInputs = Array.from(document.querySelectorAll("[data-note]"));
    el.noteStatus = $("#note-status");
    el.copyStatus = $("#copy-status");
    el.copyFallback = $("#copy-fallback");
    el.copyText = $("#copy-text");
    el.weekTitle = $("#week-title");
    el.weekPrev = $("#week-prev");
    el.weekNext = $("#week-next");
    el.weekToday = $("#week-today");
    el.weekSummary = $("#week-summary");
    el.chartDaily = $("#chart-daily");
    el.legendDaily = $("#legend-daily");
    el.dayRows = $("#day-rows");
    el.bandsNote = $("#bands-note");
    el.chartBands = $("#chart-bands");
    el.legendBands = $("#legend-bands");
    el.bandsTableBox = $("#bands-table-box");
    el.bandsTable = $("#bands-table");
    el.flowSection = $("#flow-section");
    el.flowList = $("#flow-list");
    el.weekNotesSection = $("#week-notes-section");
    el.weekNotes = $("#week-notes");
    el.downloadStatus = $("#download-status");
  }

  /** 文言だけで決まる部品を組み立てる（起動時に1回） */
  function buildStaticParts() {
    el.workChips.forEach((chip) => {
      const n = Number(chip.dataset.work);
      if (n) chip.textContent = t("minutes", { n });
    });
    el.workCustom.min = String(CONFIG.workMin);
    el.workCustom.max = String(CONFIG.workMax);
    el.breakMinutes.min = String(CONFIG.breakMin);
    el.breakMinutes.max = String(CONFIG.breakMax);

    const labels = t("feelings");
    el.feelingChips.textContent = "";
    CONFIG.feelings.forEach((key) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.action = "select-feeling";
      b.dataset.feeling = key;
      b.setAttribute("aria-pressed", "false");
      b.textContent = labels[key] || key;
      el.feelingChips.appendChild(b);
    });
  }

  function showView(name, params) {
    currentView = name;
    el.views.forEach((v) => {
      v.hidden = v.dataset.view !== name;
    });
    document.body.dataset.screen = name;
    const render = renderers[name];
    if (render) render(params || {});
    syncScreenLock();
    updateDocumentTitle(Date.now());
    window.scrollTo(0, 0);
    // 画面が切り替わったことを支援技術に伝えるため、見出しへフォーカスを移す
    const heading = document.querySelector('section[data-view="' + name + '"] [tabindex="-1"]');
    if (heading) {
      try {
        heading.focus({ preventScroll: true });
      } catch (e) {
        heading.focus();
      }
    }
  }

  const renderers = {
    start(params) {
      const settings = Store.state.settings;
      const preset = CONFIG.workPresets.indexOf(Number(settings.workMinutes)) >= 0;
      selectedWork = preset ? Number(settings.workMinutes) : "custom";
      if (!preset) el.workCustom.value = String(settings.workMinutes);
      renderWorkChoice();
      renderBreakSetting();
      renderThemeSetting();
      renderScreenSetting();
      renderNotifyStatus();
      el.startNotice.hidden = !params.notice;
      el.startNotice.textContent = params.notice || "";
      el.storageNotice.hidden = Store.available;
    },
    focus() {
      const cur = Store.state.current;
      const paused = !Timer.isRunning(cur);
      el.focusIntention.textContent = cur.intention || "";
      el.focusIntention.hidden = !cur.intention;
      el.pausedNote.hidden = !paused;
      el.pauseBtn.textContent = paused ? t("resume") : t("pause");
      el.focusView.dataset.paused = paused ? "true" : "false";
      renderClock(Date.now());
    },
    stopped(params) {
      el.stoppedDetail.textContent = t("stoppedDetail", {
        duration: formatSessionDuration(params.focusedSeconds || 0),
      });
    },
    review() {
      const cur = Store.state.current;
      el.reviewIntention.textContent = cur && cur.intention ? t("reviewIntention", { text: cur.intention }) : "";
      el.reviewIntention.hidden = !(cur && cur.intention);
      // 画面を離れている間に終わっていたときは、いつ終わったかを添える
      const late = cur && typeof cur.finishedLateAt === "number";
      el.reviewNotice.hidden = !late;
      el.reviewNotice.textContent = late ? t("finishedWhileAway", { time: formatTimeOfDay(cur.finishedLateAt) }) : "";
      renderReviewChoices();
    },
    break() {
      const cur = Store.state.current;
      const prompts = t("breakPrompts");
      el.breakPrompt.textContent = prompts[(cur.promptIndex || 0) % prompts.length];
      renderClock(Date.now());
    },
    log() {
      renderRecords();
    },
  };

  /** 振り返りの選択状態だけを描き直す（選ぶたびに呼ぶ） */
  function renderReviewChoices() {
    const cur = Store.state.current;
    const review = (cur && cur.review) || {};
    el.focusChips.forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.dataset.focus) === review.focus));
    });
    el.feelingChips.querySelectorAll("[data-feeling]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.feeling === review.feeling));
    });
  }

  function renderWorkChoice() {
    el.workChips.forEach((chip) => {
      const value = chip.dataset.work === "custom" ? "custom" : Number(chip.dataset.work);
      chip.setAttribute("aria-pressed", String(value === selectedWork));
    });
    el.customRow.hidden = selectedWork !== "custom";
    el.customHint.textContent = t("customHint");
    el.customHint.classList.remove("hint-warn");
  }

  function renderThemeSetting() {
    const theme = normalizeTheme(Store.state.settings.theme);
    document.querySelectorAll("[data-theme-choice]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.themeChoice === theme));
    });
  }

  function renderBreakSetting() {
    const n = Store.state.settings.breakMinutes;
    el.breakMinutes.value = String(n);
    el.breakSummary.textContent = t("breakSummary", { n });
  }

  function renderNotifyStatus() {
    const p = Notify.permission();
    el.notifyBtn.hidden = p !== "default";
    el.notifyTestBtn.hidden = p !== "granted";
    el.notifyOsHint.hidden = p !== "granted";
    el.notifyNote.hidden = p !== "unsupported";
    if (p === "granted") el.notifyStatus.textContent = t("notifyOn");
    else if (p === "denied") el.notifyStatus.textContent = t("notifyDenied");
    else if (p === "unsupported") el.notifyStatus.textContent = t("notifyUnsupported");
    else el.notifyStatus.textContent = "";
  }

  function renderScreenSetting() {
    const supported = ScreenLock.supported();
    el.keepScreenRow.hidden = !supported;
    el.keepScreen.checked = keepScreenOn();
    if (supported) el.keepScreenHint.textContent = t("keepScreenHint");
    else if (window.isSecureContext === false) el.keepScreenHint.textContent = t("keepScreenInsecure");
    else el.keepScreenHint.textContent = t("keepScreenUnsupported");
  }

  /** 残り時間の表示とタブのタイトルを更新する（毎回 endAt から計算） */
  function renderClock(now) {
    const cur = Store.state.current;
    if (!cur) return;
    const text = Timer.formatClock(Timer.remainingMs(cur, now));
    if (cur.phase === "focus") el.focusTime.textContent = text;
    else if (cur.phase === "break") el.breakTime.textContent = text;
    updateDocumentTitle(now);
  }

  function updateDocumentTitle(now) {
    const cur = Store.state.current;
    let title = t("docTitle");
    if (cur && (currentView === "focus" || currentView === "break")) {
      const time = Timer.formatClock(Timer.remainingMs(cur, now));
      if (cur.phase === "focus") title = t(Timer.isRunning(cur) ? "docTitleFocus" : "docTitlePaused", { time });
      else if (cur.phase === "break") title = t("docTitleBreak", { time });
    } else if (currentView === "review") {
      title = t("docTitleReview");
    }
    if (document.title !== title) document.title = title;
  }

  // ---- 記録（日ごと・週ごと） ----

  /** 記録画面で見ている場所 */
  const recordsView = { tab: "day", day: null, week: null };

  function renderRecords() {
    if (!recordsView.day) recordsView.day = todayKey();
    if (!recordsView.week) recordsView.week = weekStartKey(recordsView.day);
    const isDay = recordsView.tab === "day";
    el.tabDay.setAttribute("aria-selected", String(isDay));
    el.tabWeek.setAttribute("aria-selected", String(!isDay));
    el.panelDay.hidden = !isDay;
    el.panelWeek.hidden = isDay;
    if (isDay) renderDay();
    else renderWeek();
    el.clearBtn.hidden = Store.state.sessions.length === 0 && Object.keys(Notes.all()).length === 0;
  }

  function renderDay() {
    flushNotes();
    const key = recordsView.day;
    const today = todayKey();
    el.dayTitle.textContent = formatDayTitle(key);
    el.dayPrev.disabled = key <= earliestKey();
    el.dayNext.disabled = key >= today;
    el.dayToday.hidden = key === today;
    const sum = summarizeDay(key);
    el.daySummary.textContent = sum.count
      ? t("daySummary", { count: sum.count, duration: formatDuration(sum.totalSeconds) })
      : t("dayNoRecord");
    el.dayResumed.hidden = !sum.resumed;
    el.dayResumed.textContent = sum.resumed ? t("resumedLine", { n: sum.resumed }) : "";
    renderSessionList(el.logList, sum.sessions);
    renderNoteBox(key, true);
    el.copyStatus.textContent = "";
    el.copyFallback.hidden = true;
  }

  function renderSessionList(listEl, sessions) {
    const feelings = t("feelings");
    listEl.textContent = "";
    sessions.forEach((s) => {
      const li = document.createElement("li");
      li.className = "log-item";

      const head = document.createElement("div");
      head.className = "log-head";
      const time = document.createElement("time");
      time.className = "log-time";
      time.dateTime = new Date(s.startedAt).toISOString();
      time.textContent = formatTimeOfDay(s.startedAt);
      const badge = document.createElement("span");
      const done = s.status === "completed";
      badge.className = "badge " + (done ? "badge-completed" : "badge-interrupted");
      badge.textContent = done ? t("statusCompleted") : t("statusInterrupted");
      head.append(time, badge);

      const intention = document.createElement("p");
      intention.className = "log-intention" + (s.intention ? "" : " is-empty");
      intention.textContent = s.intention || t("noIntention");

      const meta = document.createElement("dl");
      meta.className = "log-meta";
      let duration = formatSessionDuration(sessionSeconds(s));
      if (!done && s.plannedMinutes) duration += t("logPlanned", { n: s.plannedMinutes });
      [
        [t("logDuration"), duration],
        [t("logFocus"), s.focus ? String(s.focus) : t("none")],
        [t("logFeeling"), s.feeling ? feelings[s.feeling] || s.feeling : t("none")],
      ].forEach(([label, value]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = label;
        dd.textContent = value;
        row.append(dt, dd);
        meta.appendChild(row);
      });

      li.append(head, intention, meta);
      listEl.appendChild(li);
    });
  }

  // ---- 一日のふりかえり（入力が止まって少したつと自動で保存） ----

  const noteTimers = {};

  /** force：日を移ったときは、入力中の欄も含めて表示し直す */
  function renderNoteBox(key, force) {
    const note = Notes.get(key) || {};
    el.noteInputs.forEach((input) => {
      if (!force && document.activeElement === input) return; // 入力中の欄は上書きしない
      input.value = note[input.dataset.note] || "";
      input.dataset.day = key;
    });
    if (force) {
      el.noteBox.open = NOTE_FIELDS.some((f) => note[f]);
      el.noteStatus.textContent = "";
    }
  }

  function scheduleNoteSave(input) {
    const id = input.id;
    clearTimeout(noteTimers[id]);
    noteTimers[id] = setTimeout(() => saveNote(input), 600);
  }

  function saveNote(input) {
    clearTimeout(noteTimers[input.id]);
    delete noteTimers[input.id];
    const key = input.dataset.day;
    if (!key) return;
    const before = (Notes.get(key) || {})[input.dataset.note] || "";
    if (before === input.value.trim() || before === input.value) return;
    Notes.set(key, input.dataset.note, input.value);
    el.noteStatus.textContent = t("noteSaved");
    el.clearBtn.hidden = Store.state.sessions.length === 0 && Object.keys(Notes.all()).length === 0;
  }

  /** 保存待ちのふりかえりをすぐ保存する（日を移る前・ページを離れる前） */
  function flushNotes() {
    if (!el.noteInputs) return;
    el.noteInputs.forEach((input) => {
      if (noteTimers[input.id]) saveNote(input);
    });
  }

  // ---- 週ごと ----

  function renderWeek() {
    flushNotes();
    const start = recordsView.week;
    const end = addDays(start, 6);
    const today = todayKey();
    el.weekTitle.textContent = t("weekRange", { from: formatDateLabel(start), to: formatDateLabel(end) });
    el.weekPrev.disabled = start <= weekStartKey(earliestKey());
    el.weekNext.disabled = start >= weekStartKey(today);
    el.weekToday.hidden = start === weekStartKey(today);

    const sum = summarizeRange(start, end);
    renderWeekSummary(sum);
    renderDailyChart(start, sum);
    renderDayRows(start, sum);
    renderBands(end < today ? end : today);
    renderFlow(sum);
    renderWeekNotes(start);
  }

  function addParagraph(parent, text, className) {
    const p = document.createElement("p");
    if (className) p.className = className;
    p.textContent = text;
    parent.appendChild(p);
    return p;
  }

  function renderWeekSummary(sum) {
    const box = el.weekSummary;
    box.textContent = "";
    if (!sum.count) {
      addParagraph(box, t("weekNoRecord"), "period-summary");
    } else {
      let text = t("weekSummary", { count: sum.count, duration: formatDuration(sum.totalSeconds) });
      if (sum.resumed) text += t("weekResumed", { n: sum.resumed });
      addParagraph(box, text, "period-summary");

      const items = [1, 2, 3, 4, 5].map((lv) => t("focusItem", { level: lv, n: sum.focusCounts[lv] }));
      let focusLine = t("focusBreakdown", { list: items.join(t("listSep")) });
      if (sum.focusCounts.none) focusLine += t("focusUnrated", { n: sum.focusCounts.none });
      addParagraph(box, focusLine, "summary-line");

      const labels = t("feelings");
      const feelings = CONFIG.feelings
        .filter((k) => sum.feelingCounts[k])
        .map((k) => t("feelingItem", { label: labels[k], n: sum.feelingCounts[k] }));
      if (feelings.length) addParagraph(box, t("feelingBreakdown", { list: feelings.join(t("listSep")) }), "summary-line");
    }
    const all = summarizeAll();
    if (all.count) addParagraph(box, t("totalSinceStart", { count: all.count, duration: formatDuration(all.totalSeconds) }), "summary-line summary-total");
  }

  // ---- グラフ（外部ライブラリなし。SVG を組み立てる） ----

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach((k) => node.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(node);
    return node;
  }

  function levelClass(focus) {
    return focus >= 1 && focus <= 5 ? "seg seg-f" + focus : "seg seg-none";
  }

  function renderLegend(target) {
    target.textContent = "";
    [1, 2, 3, 4, 5, "none"].forEach((lv) => {
      const sw = document.createElement("span");
      sw.className = "swatch " + (lv === "none" ? "seg-none" : "seg-f" + lv);
      sw.setAttribute("aria-hidden", "true");
      target.appendChild(sw);
    });
    const label = document.createElement("span");
    label.textContent = t("legendFocus");
    target.appendChild(label);
  }

  /** 日ごとの集中の時間：月〜日の縦棒。1本はその日の回を時刻順に積み上げたもの */
  function renderDailyChart(start, sum) {
    const W = 320;
    const H = 200;
    const top = 24;
    const bottom = 26;
    const plotH = H - top - bottom;
    const colW = W / 7;
    const barW = 26;
    const today = todayKey();
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const minutesOf = (k) => (sum.byDay[k] || []).reduce((m, s) => m + sessionSeconds(s), 0) / 60;
    const maxMin = Math.max(0, ...days.map(minutesOf));
    const yMax = Math.max(60, Math.ceil(maxMin / 30) * 30);

    const root = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg", role: "img" });
    const desc = [];
    svgEl("line", { x1: 0, x2: W, y1: top + plotH, y2: top + plotH, class: "chart-axis-line" }, root);
    const weekdays = t("weekdays");

    days.forEach((k, i) => {
      const cx = colW * i + colW / 2;
      const future = k > today;
      const label = svgEl("text", { x: cx, y: H - 8, "text-anchor": "middle", class: "chart-label" + (k === today ? " is-today" : "") + (future ? " is-future" : "") }, root);
      label.textContent = weekdays[keyToDate(k).getDay()];
      if (future) return;
      const list = sum.byDay[k] || [];
      const minutes = minutesOf(k);
      desc.push(formatDateLabel(k) + " " + (list.length ? t("countUnit", { n: list.length }) + "・" + t("minutesShort", { n: Math.round(minutes) }) : t("none")));
      if (!list.length) {
        svgEl("line", { x1: cx - barW / 2, x2: cx + barW / 2, y1: top + plotH - 1, y2: top + plotH - 1, class: "chart-empty" }, root);
        return;
      }
      let y = top + plotH;
      list.forEach((s) => {
        const h = (sessionSeconds(s) / 60 / yMax) * plotH;
        if (h <= 0) return;
        y -= h;
        svgEl("rect", { x: cx - barW / 2, y: y, width: barW, height: Math.max(h - (h > 3 ? 1 : 0), 0.5), rx: 1.5, class: levelClass(s.focus) }, root);
      });
      const value = svgEl("text", { x: cx, y: Math.max(y - 6, 12), "text-anchor": "middle", class: "chart-value" }, root);
      value.textContent = t("minutesShort", { n: Math.round(minutes) });
    });

    root.setAttribute("aria-label", t("chartDailyTitle") + "：" + desc.join("、"));
    el.chartDaily.textContent = "";
    el.chartDaily.appendChild(root);
    renderLegend(el.legendDaily);
  }

  /** 日付の一覧（7行）。行を押すと、その日の「日ごと」へ */
  function renderDayRows(start, sum) {
    const today = todayKey();
    el.dayRows.textContent = "";
    for (let i = 0; i < 7; i++) {
      const k = addDays(start, i);
      if (k > today) break;
      const list = sum.byDay[k] || [];
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "day-row";
      b.dataset.action = "goto-day";
      b.dataset.date = k;
      const minutes = Math.round(list.reduce((m, s) => m + sessionSeconds(s), 0) / 60);
      b.textContent = list.length
        ? t("dayRow", { date: formatDateLabel(k), count: list.length, minutes })
        : t("dayRowEmpty", { date: formatDateLabel(k) });
      li.appendChild(b);
      el.dayRows.appendChild(li);
    }
  }

  /** 集中しやすい時間帯（ここ4週間）：時間帯ごとの横棒。長さは回数、中は集中度ごとの濃さ */
  function renderBands(endKey) {
    const r = summarizeBands(endKey);
    const labels = t("bandLabels");
    el.chartBands.textContent = "";
    el.legendBands.textContent = "";
    el.bandsTable.textContent = "";
    el.bandsTableBox.hidden = !r.enough;
    if (!r.enough) {
      el.bandsNote.textContent = t("bandsNotEnough");
      return;
    }

    // 観察の一文（分母を必ず添える。助言はしない）
    const candidates = r.bands
      .map((b, i) => ({ i, total: b.total, high: b.levels[4] + b.levels[5] }))
      .filter((b) => b.total >= CONFIG.bandMinCount);
    const maxHigh = Math.max(0, ...candidates.map((b) => b.high));
    if (maxHigh > 0) {
      const items = candidates
        .filter((b) => b.high === maxHigh)
        .slice(0, 2)
        .map((b) => t("bandsObserveItem", { band: labels[b.i], total: b.total, high: b.high }));
      el.bandsNote.textContent = t("bandsObserve", { bands: items.join(t("bandsObserveJoin")) });
    } else {
      const most = r.bands.reduce((best, b, i) => (b.total > r.bands[best].total ? i : best), 0);
      el.bandsNote.textContent = t("bandsMost", { band: labels[most], n: r.bands[most].total });
    }

    const W = 320;
    const rowH = 42;
    const H = rowH * r.bands.length + 4;
    const trackW = W - 48;
    const maxTotal = Math.max(1, ...r.bands.map((b) => b.total));
    const root = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg", role: "img" });
    const desc = [];
    r.bands.forEach((b, i) => {
      const y0 = i * rowH;
      const few = b.total < CONFIG.bandMinCount;
      const g = svgEl("g", { class: few ? "band-row is-few" : "band-row" }, root);
      const label = svgEl("text", { x: 0, y: y0 + 14, class: "chart-label chart-label-start" }, g);
      label.textContent = labels[i] + (few && b.total ? "　" + t("bandsFew") : "");
      svgEl("rect", { x: 0, y: y0 + 20, width: trackW, height: 14, rx: 3, class: "chart-track" }, g);
      let x = 0;
      [1, 2, 3, 4, 5, "none"].forEach((lv) => {
        const n = b.levels[lv];
        if (!n) return;
        const w = (n / maxTotal) * trackW;
        svgEl("rect", { x, y: y0 + 20, width: Math.max(w - (w > 3 ? 1 : 0), 0.5), height: 14, class: lv === "none" ? "seg seg-none" : "seg seg-f" + lv }, g);
        x += w;
      });
      const count = svgEl("text", { x: W, y: y0 + 32, "text-anchor": "end", class: "chart-value" }, g);
      count.textContent = t("countUnit", { n: b.total });
      desc.push(labels[i] + " " + t("countUnit", { n: b.total }));
    });
    root.setAttribute("aria-label", t("chartBandsTitle") + "：" + desc.join("、"));
    el.chartBands.appendChild(root);
    renderLegend(el.legendBands);

    // 数字で見る（表）
    const thead = document.createElement("tr");
    [t("tableBand"), t("tableCount"), "1", "2", "3", "4", "5", t("tableUnrated")].forEach((h) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = h;
      thead.appendChild(th);
    });
    el.bandsTable.appendChild(thead);
    r.bands.forEach((b, i) => {
      const tr = document.createElement("tr");
      [labels[i], b.total, b.levels[1], b.levels[2], b.levels[3], b.levels[4], b.levels[5], b.levels.none].forEach((v, j) => {
        const cell = document.createElement(j === 0 ? "th" : "td");
        if (j === 0) cell.scope = "row";
        cell.textContent = String(v);
        tr.appendChild(cell);
      });
      el.bandsTable.appendChild(tr);
    });
  }

  /** 没頭できた時間：集中度5の回を時刻順に、やることの文をそのまま */
  function renderFlow(sum) {
    const list = sum.sessions.filter((s) => CONFIG.flowFocusLevels.indexOf(s.focus) >= 0).slice(0, CONFIG.flowMax);
    el.flowSection.hidden = !list.length;
    el.flowList.textContent = "";
    list.forEach((s) => {
      const li = document.createElement("li");
      const meta = document.createElement("span");
      meta.className = "flow-meta";
      meta.textContent = t("flowMeta", {
        date: formatDateLabel(dateKey(s.startedAt)),
        time: formatTimeOfDay(s.startedAt),
        minutes: Math.round(sessionSeconds(s) / 60),
      });
      const text = document.createElement("span");
      text.className = "flow-text" + (s.intention ? "" : " is-empty");
      text.textContent = s.intention || t("noIntention");
      li.append(meta, text);
      el.flowList.appendChild(li);
    });
  }

  /** この週のふりかえり：書いた日だけ、日付つきでそのまま並べる */
  function renderWeekNotes(start) {
    el.weekNotes.textContent = "";
    let any = false;
    for (let i = 0; i < 7; i++) {
      const k = addDays(start, i);
      const note = Notes.get(k);
      if (!note) continue;
      any = true;
      const block = document.createElement("div");
      block.className = "week-note";
      const h = document.createElement("h4");
      h.className = "week-note-date";
      h.textContent = formatDateLabel(k);
      block.appendChild(h);
      [
        ["good", "noteGood"],
        ["next", "noteNext"],
        ["moved", "copyNoteMoved"],
      ].forEach(([f, labelKey]) => {
        if (note[f]) addParagraph(block, t(labelKey) + "：" + note[f], "week-note-line");
      });
      el.weekNotes.appendChild(block);
    }
    el.weekNotesSection.hidden = !any;
  }

  // ==========================================================================
  // 8. 画面遷移のアクション
  // ==========================================================================

  function readWorkMinutes() {
    if (selectedWork !== "custom") return selectedWork;
    const n = Number(el.workCustom.value);
    if (!Number.isInteger(n) || n < CONFIG.workMin || n > CONFIG.workMax) return null;
    return n;
  }

  function startFocus() {
    const minutes = readWorkMinutes();
    if (minutes == null) {
      el.customHint.textContent = t("customInvalid");
      el.customHint.classList.add("hint-warn");
      el.workCustom.focus();
      return;
    }
    Sound.unlock();
    const intention = el.intention.value.trim();
    const now = Date.now();
    Store.updateSettings({ workMinutes: minutes });
    Store.setCurrent({
      phase: "focus",
      sessionId: newId(),
      startedAt: now,
      plannedMinutes: minutes,
      intention,
      endAt: now + minutes * 60000,
      remainingMs: null,
    });
    el.intention.value = "";
    el.intention.blur();
    showView("focus");
    startTicking();
  }

  function togglePause() {
    const cur = Store.state.current;
    if (!cur || cur.phase !== "focus") return;
    const now = Date.now();
    if (Timer.isRunning(cur)) {
      const rest = cur.endAt - now;
      if (rest <= 0) {
        onPhaseEnd(false);
        return;
      }
      Store.updateCurrent({ endAt: null, remainingMs: rest });
      stopTicking();
    } else {
      Sound.unlock();
      Store.updateCurrent({ endAt: now + Number(cur.remainingMs || 0), remainingMs: null });
      startTicking();
    }
    renderers.focus();
    syncScreenLock();
    updateDocumentTitle(now);
  }

  function stopFocus() {
    const cur = Store.state.current;
    if (!cur || cur.phase !== "focus") return;
    const now = Date.now();
    if (Timer.isRunning(cur) && now >= cur.endAt) {
      onPhaseEnd(false);
      return;
    }
    stopTicking();
    const plannedMs = cur.plannedMinutes * 60000;
    const focusedSeconds = Math.max(0, Math.round((plannedMs - Timer.remainingMs(cur, now)) / 1000));
    Store.upsertSession({
      id: cur.sessionId,
      startedAt: cur.startedAt,
      endedAt: now,
      plannedMinutes: cur.plannedMinutes,
      intention: cur.intention,
      status: "interrupted",
      focus: null,
      feeling: null,
      focusedSeconds,
    });
    Store.setCurrent(null);
    showView("stopped", { focusedSeconds });
  }

  /** 作業時間が終わったとき。この時点で「完了」として記録しておく */
  function completeFocus(endedAt, silent) {
    const cur = Store.state.current;
    stopTicking();
    Store.upsertSession({
      id: cur.sessionId,
      startedAt: cur.startedAt,
      endedAt,
      plannedMinutes: cur.plannedMinutes,
      intention: cur.intention,
      status: "completed",
      focus: null,
      feeling: null,
      focusedSeconds: cur.plannedMinutes * 60,
    });
    Store.setCurrent({
      phase: "review",
      sessionId: cur.sessionId,
      startedAt: cur.startedAt,
      plannedMinutes: cur.plannedMinutes,
      intention: cur.intention,
      endAt: null,
      remainingMs: null,
      review: { focus: null, feeling: null },
      // 終了から1分以上たって気づいた（画面ロック中だった・再読み込みした）ときの終了時刻
      finishedLateAt: Date.now() - endedAt > 60 * 1000 ? endedAt : null,
    });
    showView("review");
    if (!silent) {
      Sound.chime();
      Notify.show(t("notifyFocusTitle"), t("notifyFocusBody"), "coachingl-pomodoro-focus-" + endedAt);
    }
  }

  function selectReview(field, value) {
    const cur = Store.state.current;
    if (!cur || cur.phase !== "review") return;
    const review = Object.assign({ focus: null, feeling: null }, cur.review);
    review[field] = review[field] === value ? null : value; // もう一度押すと選択を外す
    Store.updateCurrent({ review });
    renderReviewChoices();
  }

  function saveReviewAndBreak() {
    const cur = Store.state.current;
    if (!cur || cur.phase !== "review") return;
    const review = cur.review || {};
    Store.updateSession(cur.sessionId, {
      focus: review.focus || null,
      feeling: review.feeling || null,
    });
    startBreak();
  }

  function startBreak() {
    Sound.unlock();
    const minutes = Store.state.settings.breakMinutes;
    const now = Date.now();
    Store.setCurrent({
      phase: "break",
      startedAt: now,
      plannedMinutes: minutes,
      endAt: now + minutes * 60000,
      remainingMs: null,
      promptIndex: drawPromptIndex(t("breakPrompts").length),
    });
    showView("break");
    startTicking();
  }

  /** 休憩の時間が終わったとき */
  function finishBreak(silent, endAt) {
    stopTicking();
    Store.setCurrent(null);
    showView("start", { notice: t("breakEndedNotice") });
    if (!silent) {
      Sound.chime();
      Notify.show(t("notifyBreakTitle"), t("notifyBreakBody"), "coachingl-pomodoro-break-" + endAt);
    }
  }

  /** 休憩を途中で切り上げてスタートへ */
  function endBreakEarly() {
    stopTicking();
    Store.setCurrent(null);
    showView("start");
  }

  function onPhaseEnd(silent) {
    const cur = Store.state.current;
    if (!cur) return;
    if (cur.phase === "focus") completeFocus(cur.endAt, silent);
    else if (cur.phase === "break") finishBreak(silent, cur.endAt);
  }

  function goStart() {
    if (Store.state.current) {
      restore();
      return;
    }
    showView("start");
  }

  function clearAll() {
    flushNotes();
    if (!window.confirm(t("clearConfirm"))) return;
    Store.clearSessions();
    Notes.clear();
    recordsView.day = todayKey();
    recordsView.week = weekStartKey(recordsView.day);
    renderRecords();
    el.logStatus.textContent = t("cleared");
  }

  function openRecords() {
    recordsView.tab = "day";
    recordsView.day = todayKey();
    recordsView.week = weekStartKey(recordsView.day);
    el.logStatus.textContent = "";
    el.downloadStatus.textContent = "";
    showView("log");
  }

  /** 日や週を動かす。未来と、いちばん古い記録より前には動かない */
  function moveDay(delta) {
    const today = todayKey();
    let k = delta === 0 ? today : addDays(recordsView.day, delta);
    if (k > today) k = today;
    if (k < earliestKey()) k = earliestKey();
    recordsView.day = k;
    renderRecords();
  }

  function moveWeek(delta) {
    const thisWeek = weekStartKey(todayKey());
    let k = delta === 0 ? thisWeek : addDays(recordsView.week, delta * 7);
    if (k > thisWeek) k = thisWeek;
    const first = weekStartKey(earliestKey());
    if (k < first) k = first;
    recordsView.week = k;
    renderRecords();
  }

  function setRecordsTab(tab) {
    if (tab === recordsView.tab) return;
    if (tab === "week") recordsView.week = weekStartKey(recordsView.day);
    recordsView.tab = tab;
    renderRecords();
  }

  // ---- この日をコピー（LINE などに貼れる文章） ----

  function buildDayText(key) {
    const sum = summarizeDay(key);
    const feelings = t("feelings");
    const lines = [t("copyHeader", { date: formatDateLabel(key) })];
    lines.push(sum.count ? t("daySummary", { count: sum.count, duration: formatDuration(sum.totalSeconds) }) : t("dayNoRecord"));
    sum.sessions.forEach((s) => {
      const parts = [formatTimeOfDay(s.startedAt), s.intention || t("noIntention"), formatSessionDuration(sessionSeconds(s))];
      if (s.status === "interrupted") parts[2] += t("copyInterrupted");
      if (s.focus) parts.push(t("copyFocus", { n: s.focus }));
      if (s.feeling) parts.push(feelings[s.feeling] || s.feeling);
      lines.push(parts.join(" "));
    });
    if (sum.resumed) lines.push(t("resumedLine", { n: sum.resumed }));
    const note = Notes.get(key) || {};
    [
      ["good", "copyNoteGood"],
      ["next", "copyNoteNext"],
      ["moved", "copyNoteMoved"],
    ].forEach(([f, labelKey]) => {
      if (note[f]) lines.push(t(labelKey) + "：" + note[f].replace(/\r?\n/g, " "));
    });
    return lines.join("\n");
  }

  function copyDay() {
    flushNotes();
    const text = buildDayText(recordsView.day);
    const showFallback = () => {
      el.copyFallback.hidden = false;
      el.copyText.value = text;
      el.copyText.focus();
      el.copyText.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      el.copyStatus.textContent = ok ? t("copied") : "";
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          el.copyFallback.hidden = true;
          el.copyStatus.textContent = t("copied");
        },
        showFallback
      );
    } else {
      showFallback();
    }
  }

  // ---- 記録のダウンロード ----

  /** CSV の1マス。文字の列は "" で囲み、数式として実行されないようにする */
  function csvCell(value, isText) {
    let v = value == null ? "" : String(value);
    v = v.replace(/\r\n|\r|\n/g, "／");
    if (!isText) return v;
    if (/^[=+\-@\t]/.test(v)) v = "'" + v;
    return '"' + v.replace(/"/g, '""') + '"';
  }

  function buildCsv() {
    const feelings = t("feelings");
    const weekdays = t("weekdays");
    const rows = [t("csvHeaders").map((h) => csvCell(h, true)).join(",")];
    validSessions().forEach((s) => {
      const minutes = Math.round(sessionSeconds(s) / 6) / 10;
      rows.push(
        [
          csvCell(formatDateCsv(s.startedAt)),
          csvCell(weekdays[new Date(s.startedAt).getDay()], true),
          csvCell(formatTimeOfDay(s.startedAt)),
          csvCell(typeof s.endedAt === "number" ? formatTimeOfDay(s.endedAt) : ""),
          csvCell(s.intention || "", true),
          csvCell(s.status === "completed" ? t("statusCompleted") : t("statusInterrupted"), true),
          csvCell(minutes),
          csvCell(s.plannedMinutes != null ? s.plannedMinutes : ""),
          csvCell(s.focus || ""),
          csvCell(s.feeling ? feelings[s.feeling] || s.feeling : "", true),
          csvCell(s.id || "", true),
        ].join(",")
      );
    });
    return "\ufeff" + rows.join("\r\n") + "\r\n";
  }

  function isoWithOffset(date) {
    const off = -date.getTimezoneOffset();
    const sign = off >= 0 ? "+" : "-";
    const a = Math.abs(off);
    return (
      dateKey(date) + "T" + pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds()) +
      sign + pad2(Math.floor(a / 60)) + ":" + pad2(a % 60)
    );
  }

  function buildJson() {
    const data = {
      format: "coachingl-pomodoro-data",
      formatVersion: 1,
      exportedAt: isoWithOffset(new Date()),
      settings: Store.state.settings,
      sessions: validSessions(),
      days: Notes.all(),
    };
    return JSON.stringify(data, null, 2);
  }

  let persistRequested = false;

  function downloadFile(name, mime, text) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    el.downloadStatus.textContent = t("downloaded", { name });
    // ブラウザに「この記録は消さないで」と頼む（結果は画面に出さない）
    if (!persistRequested && navigator.storage && navigator.storage.persist) {
      persistRequested = true;
      navigator.storage.persist().catch(() => {});
    }
  }

  function fileStamp() {
    return todayKey().replace(/-/g, "");
  }

  function downloadCsv() {
    downloadFile("coachingl-pomodoro_sessions_" + fileStamp() + ".csv", "text/csv;charset=utf-8", buildCsv());
  }

  function downloadJson() {
    flushNotes();
    downloadFile("coachingl-pomodoro_data_" + fileStamp() + ".json", "application/json;charset=utf-8", buildJson());
  }

  function setBreakMinutes() {
    const n = Number(el.breakMinutes.value);
    if (Number.isInteger(n) && n >= CONFIG.breakMin && n <= CONFIG.breakMax) {
      Store.updateSettings({ breakMinutes: n });
    }
    renderBreakSetting();
  }

  function testNotify() {
    el.notifyTestStatus.textContent = t("notifyTestSent");
    setTimeout(() => {
      const ok = Notify.show(t("notifyTestTitle"), t("notifyTestBody"), "coachingl-pomodoro-test-" + Date.now());
      el.notifyTestStatus.textContent = ok ? "" : t("notifyBroken");
      if (!ok) renderNotifyStatus();
    }, 5000);
  }

  function setKeepScreen() {
    Store.updateSettings({ keepScreenOn: el.keepScreen.checked });
    syncScreenLock();
  }

  function requestNotify() {
    Sound.unlock();
    Notify.request().then(renderNotifyStatus);
  }

  // ==========================================================================
  // 9. イベント登録と起動
  // ==========================================================================

  /** 保存されている状態から画面を復元する（再読み込み・別タブでの変更時） */
  function restore() {
    stopTicking();
    const cur = Store.state.current;
    const now = Date.now();
    if (!isValidCurrent(cur)) {
      if (cur) Store.setCurrent(null);
      showView("start");
      return;
    }
    if (cur.phase === "focus") {
      if (Timer.isRunning(cur) && now >= cur.endAt) {
        completeFocus(cur.endAt, true); // 閉じている間に終わっていた
        return;
      }
      touchHintArmed = true;
      showView("focus");
      startTicking();
    } else if (cur.phase === "review") {
      showView("review");
    } else if (cur.phase === "break") {
      if (Timer.isRunning(cur) && now >= cur.endAt) {
        finishBreak(true, cur.endAt);
        return;
      }
      touchHintArmed = true;
      showView("break");
      startTicking();
    }
  }

  function isValidCurrent(cur) {
    if (!isObject(cur)) return false;
    if (["focus", "review", "break"].indexOf(cur.phase) < 0) return false;
    if (typeof cur.plannedMinutes !== "number") return false;
    if (cur.phase === "review") return typeof cur.sessionId === "string";
    if (cur.endAt == null) return typeof cur.remainingMs === "number";
    return typeof cur.endAt === "number";
  }

  function bindEvents() {
    el.startForm.addEventListener("submit", (e) => {
      e.preventDefault();
      startFocus();
    });

    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      switch (target.dataset.action) {
        case "select-theme": {
          const theme = normalizeTheme(target.dataset.themeChoice);
          Store.updateSettings({ theme });
          applyTheme(theme);
          renderThemeSetting();
          break;
        }
        case "select-work": {
          const v = target.dataset.work;
          selectedWork = v === "custom" ? "custom" : Number(v);
          if (selectedWork !== "custom") Store.updateSettings({ workMinutes: selectedWork });
          renderWorkChoice();
          if (selectedWork === "custom") {
            if (!el.workCustom.value) el.workCustom.value = String(Store.state.settings.workMinutes);
            el.workCustom.focus();
          }
          break;
        }
        case "open-log":
          openRecords();
          break;
        case "log-tab":
          setRecordsTab(target.dataset.tab);
          break;
        case "day-prev":
          moveDay(-1);
          break;
        case "day-next":
          moveDay(1);
          break;
        case "day-today":
          moveDay(0);
          break;
        case "week-prev":
          moveWeek(-1);
          break;
        case "week-next":
          moveWeek(1);
          break;
        case "week-today":
          moveWeek(0);
          break;
        case "goto-day":
          recordsView.tab = "day";
          recordsView.day = target.dataset.date;
          renderRecords();
          el.panelDay.scrollIntoView({ block: "start" });
          break;
        case "copy-day":
          copyDay();
          break;
        case "download-csv":
          downloadCsv();
          break;
        case "download-json":
          downloadJson();
          break;
        case "go-start":
          goStart();
          break;
        case "toggle-pause":
          togglePause();
          break;
        case "stop":
          stopFocus();
          break;
        case "select-focus":
          selectReview("focus", Number(target.dataset.focus));
          break;
        case "select-feeling":
          selectReview("feeling", target.dataset.feeling);
          break;
        case "to-break":
          saveReviewAndBreak();
          break;
        case "end-break":
          endBreakEarly();
          break;
        case "clear-all":
          clearAll();
          break;
        case "test-notify":
          testNotify();
          break;
        case "request-notify":
          requestNotify();
          break;
        default:
          break;
      }
    });

    el.breakMinutes.addEventListener("change", setBreakMinutes);
    el.keepScreen.addEventListener("change", setKeepScreen);
    el.noteInputs.forEach((input) => {
      input.addEventListener("input", () => {
        el.noteStatus.textContent = "";
        scheduleNoteSave(input);
      });
      input.addEventListener("blur", () => saveNote(input));
    });
    // ページを離れる前に、保存待ちのふりかえりを保存する
    window.addEventListener("pagehide", flushNotes);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) flushNotes();
    });
    el.workCustom.addEventListener("input", () => {
      el.customHint.textContent = t("customHint");
      el.customHint.classList.remove("hint-warn");
      const n = readWorkMinutes();
      if (n != null) Store.updateSettings({ workMinutes: n });
    });

    // ユーザー操作のたびに、音の再生制限の解除と画面ロック防止の取り直しをしておく
    // （再読み込み後やタブに戻ったあとでもチャイムが鳴るように）。
    // スマホのタッチでは pointerdown は「ユーザー操作」に数えられないので、pointerup / touchend も使う。
    ["pointerdown", "pointerup", "touchend", "keydown", "click"].forEach((type) => {
      document.addEventListener(
        type,
        () => {
          Sound.unlock();
          syncScreenLock();
        },
        { passive: true }
      );
    });

    // タブに戻ったとき・ページが復帰したときは、終了予定時刻から計算し直す
    const recalc = () => {
      if (document.hidden) return;
      Notify.closeEverywhere(); // 戻ってきたので、残っている通知は片付ける
      if (Timer.isRunning(Store.state.current)) startTicking();
      syncScreenLock();
    };
    document.addEventListener("visibilitychange", recalc);
    window.addEventListener("pageshow", recalc);
    window.addEventListener("focus", recalc);

    // 別のタブで状態が変わったら追従する
    window.addEventListener("storage", (e) => {
      if (e.key === NOTES_KEY || e.key === null) {
        Notes.load();
        if (currentView === "log") {
          if (recordsView.tab === "day") renderNoteBox(recordsView.day, false);
          else renderWeek();
        }
        if (e.key === NOTES_KEY) return;
      }
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      const before = JSON.stringify(Store.state.current);
      Store.load();
      applyTheme(Store.state.settings.theme);
      renderThemeSetting();
      if (JSON.stringify(Store.state.current) !== before) restore();
      else if (currentView === "log") renderRecords();
    });
  }

  function init() {
    cacheElements();
    applyI18n(document);
    buildStaticParts();
    Store.load();
    Notes.load();
    applyTheme(Store.state.settings.theme);
    Notify.init();
    bindEvents();
    restore();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
