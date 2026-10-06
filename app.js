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
 *   6. 集計（summarizeToday）
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
      openLog: "今日の記録",
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

      // 今日の記録
      logTitle: "今日の記録",
      logCount: "回数",
      logTotal: "合計集中時間",
      countUnit: "{n}回",
      logEmpty: "今日の記録はまだありません。",
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
      clearConfirm: "すべての記録を消します。元には戻せません。よろしいですか？",
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

    /** 保存データを現在の形式にそろえる（形式を変えるときはここに移行処理を足す） */
    function migrate(data) {
      const base = blank();
      if (!data || typeof data !== "object") return base;
      return {
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
      };
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

  function isSameLocalDay(ts, ref) {
    const d = new Date(ts);
    return (
      d.getFullYear() === ref.getFullYear() &&
      d.getMonth() === ref.getMonth() &&
      d.getDate() === ref.getDate()
    );
  }

  function sessionSeconds(s) {
    if (typeof s.focusedSeconds === "number") return s.focusedSeconds;
    if (s.status === "completed") return (Number(s.plannedMinutes) || 0) * 60;
    return Math.max(0, Math.round(((s.endedAt || 0) - (s.startedAt || 0)) / 1000));
  }

  function summarizeToday(sessions, now) {
    const ref = now || new Date();
    const list = sessions
      .filter((s) => typeof s.startedAt === "number" && isSameLocalDay(s.startedAt, ref))
      .sort((a, b) => a.startedAt - b.startedAt);
    return {
      sessions: list,
      count: list.length,
      completedCount: list.filter((s) => s.status === "completed").length,
      totalSeconds: list.reduce((sum, s) => sum + sessionSeconds(s), 0),
    };
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
    el.sumCount = $("#sum-count");
    el.sumTotal = $("#sum-total");
    el.logList = $("#log-list");
    el.logEmpty = $("#log-empty");
    el.logStatus = $("#log-status");
    el.clearBtn = $("#clear-btn");
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
      renderLog();
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

  function renderLog() {
    const summary = summarizeToday(Store.state.sessions, new Date());
    const feelings = t("feelings");
    el.sumCount.textContent = t("countUnit", { n: summary.count });
    el.sumTotal.textContent = formatDuration(summary.totalSeconds);
    el.logEmpty.hidden = summary.count > 0;
    el.clearBtn.hidden = Store.state.sessions.length === 0;
    el.logList.textContent = "";

    summary.sessions.forEach((s) => {
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
      el.logList.appendChild(li);
    });
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
    if (!window.confirm(t("clearConfirm"))) return;
    Store.clearSessions();
    renderLog();
    el.logStatus.textContent = t("cleared");
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
          el.logStatus.textContent = "";
          showView("log");
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
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      const before = JSON.stringify(Store.state.current);
      Store.load();
      applyTheme(Store.state.settings.theme);
      renderThemeSetting();
      if (JSON.stringify(Store.state.current) !== before) restore();
      else if (currentView === "log") renderLog();
    });
  }

  function init() {
    cacheElements();
    applyI18n(document);
    buildStaticParts();
    Store.load();
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
