import { useEffect, useState } from "react";

/* =========================================================
   TRẠNG THÁI LÁ THƯ
   ========================================================= */
type LetterPhase = "closed" | "open" | "closing";

const CLOSE_DURATION = 1200;

/* =========================================================
   HIỆU ỨNG VIẾT CHỮ
   ========================================================= */

/* Chờ lá thư mở ra rồi mới bắt đầu viết */
const TYPE_START_DELAY = 900;

/* Tốc độ viết từng ký tự
   Số nhỏ = nhanh
   Số lớn = chậm */
const TYPE_SPEED = 70;

/* =========================================================
   NỘI DUNG THƯ

   MỖI PHẦN TỬ = 1 DÒNG TRÊN TỜ GIẤY

   Muốn chữ nằm đúng dòng kẻ nào
   -> chỉnh .line-1, .line-2... trong index.css
   ========================================================= */

const LINES = [
  {
    text: "Dear my love,",
    className: "line-1",
  },
  {
    text: "Hi, Chúc Cún của anh có một ngày thật là hạnh phúc!",
    className: "line-2",
  },
  {
    text: "Thế giới ngoài kia dù có tệ với em thế nào đi chăng nữa",
    className: "line-3",
  },
  {
    text: "thì vẫn có anh ở đây với em, ôm em, lắng nghe em ",
    className: "line-4",
  },
  {
    text: "và đồng hành cùng em.",
    className: "line-5",
  },
  {
    text: " I hope the world is kind to you today, tomorrow,",
    className: "line-6",
  },
  {
    text: "the day after that, and forever.",
    className: "line-7",
  },
  {
    text: "Yêu em ♡",
    className: "line-8",
  },
].map((line) => ({
  ...line,
  chars: Array.from(line.text.normalize("NFC")),
}));

const TOTAL_CHARS = LINES.reduce(
  (sum, line) => sum + line.chars.length,
  0
);

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [phase, setPhase] =
    useState<LetterPhase>("closed");

  const [typed, setTyped] = useState(0);

  const isOpen = phase === "open";
  const isClosing = phase === "closing";

  const isTyping =
    isOpen && typed < TOTAL_CHARS;

  /* =======================================================
     ĐÓNG THƯ
     ======================================================= */

  useEffect(() => {
    if (phase !== "closing") return;

    const timer = window.setTimeout(() => {
      setPhase("closed");
    }, CLOSE_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase]);

  /* =======================================================
     HIỆU ỨNG VIẾT TỪNG KÝ TỰ
     ======================================================= */

  useEffect(() => {
    /* Đóng hẳn thư -> reset chữ */
    if (phase === "closed") {
      setTyped(0);
      return;
    }

    if (phase !== "open") return;

    let interval: number | undefined;

    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setTyped((current) => {
          if (current >= TOTAL_CHARS) {
            window.clearInterval(interval);
            return current;
          }

          return current + 1;
        });
      }, TYPE_SPEED);
    }, TYPE_START_DELAY);

    return () => {
      window.clearTimeout(start);

      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [phase]);

  /* =======================================================
     MỞ / ĐÓNG THƯ
     ======================================================= */

  const handleEnvelopeClick = () => {
    if (phase === "closed") {
      setPhase("open");
    } else if (phase === "open") {
      setPhase("closing");
    }
  };

  /* =======================================================
     TÍNH CHỮ ĐÃ VIẾT CHO TỪNG DÒNG
     ======================================================= */

  let offset = 0;

  const renderedLines = LINES.map((line, index) => {
    const start = offset;

    offset += line.chars.length;

    const shown = Math.max(
      0,
      Math.min(
        line.chars.length,
        typed - start
      )
    );

    const isActiveLine =
      isTyping &&
      typed >= start &&
      typed < offset;

    return (
      <p
        key={index}
        className={`message-line ${line.className}`}
      >
        {line.chars
          .slice(0, shown)
          .join("")}

        {isActiveLine && (
          <span
            className="quill"
            aria-hidden="true"
          />
        )}
      </p>
    );
  });

  return (
    <main className="experience">

      <section
        className={`letter-scene is-${phase}`}
        aria-label="Một lá thư gửi đến bạn"
      >

        {/* ================================
            NỀN
            ================================ */}

        <div
          className="layer layer--bg"
          aria-hidden="true"
        />

        {/* ================================
            PHONG BÌ ĐÓNG
            ================================ */}

        <div
          className="layer layer--envelope"
          aria-hidden="true"
        />

        {/* ================================
            THƯ MỞ
            ================================ */}

        <div
          className="layer layer--open"
          aria-hidden="true"
        />

        {/* ================================
            NÚT MỞ / ĐÓNG THƯ
            ================================ */}

        <button
          className="envelope-trigger"
          type="button"
          onClick={handleEnvelopeClick}
          disabled={isClosing}
          aria-label={
            isOpen
              ? "Đóng lá thư"
              : "Mở lá thư"
          }
        >
          <span
            className="tap-ring"
            aria-hidden="true"
          />
        </button>

        {/* ================================
            CÁC DÒNG CHỮ
            ================================ */}

        <article
          className="message"
          aria-hidden={!isOpen}
        >
          {renderedLines}
        </article>

      </section>
    </main>
  );
}