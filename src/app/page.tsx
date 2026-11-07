import Link from "next/link";
import { PublicShell } from "./PublicShell";
import { NucleusExplorer } from "@/components/learning/NucleusExplorer";
import { NUCLEAR_REACTIONS } from "@/lib/nuclear-science";
import { NUCLEAR_LAB_LESSONS, nuclearLabUrl } from "@/lib/nuclear-lab-lessons";
import styles from "./nuclear-lab.module.css";
import { LatexMath } from "@/components/learning/LatexMath";

const CHAPTER_LESSONS = [
  {
    ...NUCLEAR_LAB_LESSONS[0],
    number: "Bài 21",
    summary:
      "Thí nghiệm tán xạ hạt alpha của Rutherford, cấu tạo hạt nhân từ các nucleon (proton và neutron), kí hiệu hạt nhân và đồng vị.",
    latex:
      "A = Z + N, \\qquad R = R_0 \\cdot A^{1/3} \\quad (R_0 \\approx 1{,}2 \\times 10^{-15}\\text{ m})",
    nuclideExample: "{}_{Z}^{A}\\mathrm{X}, \\quad {}_{6}^{12}\\mathrm{C}, \\quad {}_{92}^{235}\\mathrm{U}",
  },
  {
    ...NUCLEAR_LAB_LESSONS[1],
    number: "Bài 22",
    summary:
      "Lực hạt nhân, độ hụt khối, năng lượng liên kết, năng lượng liên kết riêng, định luật bảo toàn số nucleon và điện tích trong phản ứng phân hạch, nhiệt hạch.",
    latex:
      "\\Delta m = \\left[Z m_p + (A - Z) m_n\\right] - m_X, \\qquad E_{\\text{lk}} = \\Delta m \\cdot c^2, \\qquad E_{\\text{lkr}} = \\frac{E_{\\text{lk}}}{A}",
    nuclideExample:
      "{}_{1}^{2}\\mathrm{H} + {}_{1}^{3}\\mathrm{H} \\rightarrow {}_{2}^{4}\\mathrm{He} + {}_{0}^{1}\\mathrm{n} + 17{,}6\\text{ MeV}",
  },
  {
    ...NUCLEAR_LAB_LESSONS[2],
    number: "Bài 23",
    summary:
      "Bản chất và tính chất của các tia phóng xạ alpha, beta, gamma; định luật phóng xạ, chu kì bán rã, hằng số phóng xạ và độ phóng xạ.",
    latex:
      "N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\qquad \\lambda = \\frac{\\ln 2}{T}, \\qquad H(t) = \\lambda N(t)",
    nuclideExample:
      "{}_{88}^{226}\\mathrm{Ra} \\rightarrow {}_{86}^{222}\\mathrm{Rn} + {}_{2}^{4}\\mathrm{He}",
  },
  {
    ...NUCLEAR_LAB_LESSONS[3],
    number: "Bài 24",
    summary:
      "Nguyên lí hoạt động của nhà máy điện hạt nhân, điều khiển phản ứng phân hạch dây chuyền và ứng dụng đồng vị phóng xạ trong y học, nông nghiệp, công nghiệp, khảo cổ.",
    latex: NUCLEAR_REACTIONS.fission.latex,
    nuclideExample: "k = 1 \\text{ (tới hạn)}, \\quad k < 1 \\text{ (dưới tới hạn)}",
  },
  {
    ...NUCLEAR_LAB_LESSONS[4],
    number: "Bài 25",
    summary:
      "Tổng hợp hệ thức định lượng Chương IV, xử lí bảng số liệu thực nghiệm xác định chu kì bán rã, bài toán định tuổi cổ vật Carbon-14 và nguyên tắc an toàn bức xạ.",
    latex:
      "\\Delta E = \\left(\\sum m_{\\text{trước}} - \\sum m_{\\text{sau}}\\right)c^2, \\qquad \\Delta N(t) = N_0\\left(1 - 2^{-\\frac{t}{T}}\\right)",
    nuclideExample: "t = \\frac{T}{\\ln 2} \\ln\\!\\left(\\frac{H_0}{H(t)}\\right)",
  },
];

export default function Home() {
  return (
    <PublicShell floatingTutor={false}>
      <div className={styles.lab}>
        <section className={styles.hero} aria-labelledby="lab-title">
          <div className={styles.heroInner}>
            <div>
              <p className={styles.eyebrow}>Phòng khám phá · Vật lí 12</p>
              <h1 id="lab-title">Vật lí <span>hạt nhân</span></h1>
              <p className={styles.lead}>Bắt đầu với hạt nhân carbon-12. Xoay mô hình, chọn từng nucleon và dùng cắt lớp để quan sát bên trong. Sau đó, dùng video và bài tập để khám phá trọn chương B21–B25.</p>
              <div className={styles.links}>
                <Link href={nuclearLabUrl("B21", "video")} className={styles.primary}>Video bài học ↗</Link>
                <a href="#mo-hinh-trang-chu">Quan sát 3D ↓</a>
                <Link href="/hoc-lieu">Kho học liệu</Link>
                <Link href="/demo-lesson">Tiến trình ba pha</Link>
              </div>
              <div className={styles.ledger}>
                <span><strong>05</strong> bài học</span>
                <span><strong>03</strong> pha học tập</span>
                <span><strong>¹²C</strong> mẫu quan sát đầu tiên</span>
              </div>
            </div>
            <div id="mo-hinh-trang-chu" className={styles.stage}>
              <p className={styles.stageLabel}>Mẫu quan sát 01 · Carbon-12</p>
              <NucleusExplorer isotopeId="C12" compact />
            </div>
          </div>
          <nav aria-label="Mô hình và video theo bài" className={`${styles.wrap} ${styles.lessonRail}`}>
            <p>Chọn bài để mở mô hình và video</p>
            <div>
              {NUCLEAR_LAB_LESSONS.map((lesson) => (
                <Link key={lesson.code} href={nuclearLabUrl(lesson.code)}>
                  <strong>{lesson.code}</strong><span>{lesson.title}</span>
                </Link>
              ))}
            </div>
          </nav>
        </section>

      {/* ================================================================= */}
      {/* 2. TIẾN TRÌNH LỚP HỌC ĐẢO NGƯỢC 3 GIAI ĐOẠN (ARCHITECTURAL GRID)  */}
      {/* ================================================================= */}
      <section
        style={{
          borderTop: "1px solid var(--border-light)",
          borderBottom: "1px solid var(--border-light)",
          background: "var(--bg-surface)",
          padding: "60px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div style={{ maxWidth: "680px" }}>
              <p
                className="mono-tag"
                style={{
                  margin: "0 0 8px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                PHƯƠNG PHÁP TỔ CHỨC DẠY HỌC
              </p>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "26px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Cấu trúc tiến trình Lớp học đảo ngược 3 giai đoạn
              </h2>
              <p style={{ margin: 0, fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                Thiết kế đồng bộ giữa hoạt động chuẩn bị kiến thức nền tảng tại nhà, thảo luận giải quyết vấn đề trên lớp và tự điều chỉnh sau giờ học.
              </p>
            </div>

            <Link
              href="/demo-lesson"
              className="btn"
              style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}
            >
              Trải nghiệm tiến trình mẫu →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                step: "GIAI ĐOẠN 01 · TRƯỚC GIỜ HỌC",
                location: "Tự học tại nhà",
                title: "Khám phá mô phỏng và kiểm tra chẩn đoán",
                desc: "Học sinh tương tác với mô phỏng 3D về cấu trúc hạt nhân, sự phân rã phóng xạ, đọc tư liệu lịch sử và hoàn thành câu hỏi chẩn đoán nhanh có phản hồi tức thời.",
                latex: "A = Z + N, \\quad R = 1{,}2 \\times 10^{-15} A^{1/3}\\text{ m}",
                href: "/demo-lesson",
                cta: "Thực hành Giai đoạn 1 →",
              },
              {
                step: "GIAI ĐOẠN 02 · TRONG GIỜ HỌC",
                location: "Hoạt động tại lớp",
                title: "Xử lí số liệu thực nghiệm và tranh biện",
                desc: "Làm việc nhóm xử lí bảng số liệu thực nghiệm vẽ đồ thị chu kì bán rã, lập sơ đồ ứng dụng đồng vị phóng xạ và đóng vai hội đồng thẩm định an toàn điện hạt nhân.",
                latex: "N(t) = N_0 \\cdot 2^{-\\frac{t}{T}}, \\quad \\Delta E = \\Delta m \\cdot c^2",
                href: "/demo-lesson",
                cta: "Thực hành Giai đoạn 2 →",
              },
              {
                step: "GIAI ĐOẠN 03 · SAU GIỜ HỌC",
                location: "Tự điều chỉnh (SRL)",
                title: "Luyện tập phân hóa và nhật kí tự học",
                desc: "Giải bài tập định lượng phân hóa, ghi nhận nhật kí tự đánh giá năng lực tự học (SRL) và tra cứu gợi ý từng bước cùng Trợ lí học tập Vật lí 12.",
                latex: "\\Delta N(t) = N_0\\left(1 - e^{-\\frac{\\ln 2}{T}t}\\right)",
                href: "/hoc-lieu/ai",
                cta: "Mở Trợ lí học tập & SRL →",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="editorial-surface"
                style={{
                  padding: "24px",
                  background: "var(--bg-page)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid var(--border-light)",
                    }}
                  >
                    <span
                      className="mono-tag"
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.step}
                    </span>
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                      }}
                    >
                      {item.location}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: "0 0 10px",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.65,
                      marginBottom: "16px",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "6px",
                      marginBottom: "14px",
                      overflowX: "auto",
                    }}
                  >
                    <LatexMath math={item.latex} />
                  </div>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      textDecoration: "none",
                    }}
                  >
                    {item.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. MỤC LỤC BÀI HỌC & CÔNG THỨC TRỌNG TÂM CHƯƠNG IV (B21 -> B25)   */}
      {/* ================================================================= */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 24px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              className="mono-tag"
              style={{
                margin: "0 0 8px",
                fontSize: "11.5px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-muted)",
              }}
            >
              MỤC LỤC HỌC LIỆU · SGK VẬT LÍ 12 KẾT NỐI TRI THỨC
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Hệ thống Bài học và Công thức Trọng tâm (Bài 21 – Bài 25)
            </h2>
          </div>

          <Link
            href="/hoc-lieu"
            style={{
              fontSize: "13.5px",
              fontWeight: 600,
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            Xem toàn bộ kho học liệu →
          </Link>
        </div>

        {/* Hairline Scientific Syllabus Index */}
        <div style={{ borderTop: "1.5px solid var(--color-primary)" }}>
          {CHAPTER_LESSONS.map((lesson) => (
            <div
              key={lesson.code}
              style={{
                padding: "26px 0",
                borderBottom: "1px solid var(--border-light)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "24px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  className="mono-tag"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-primary)",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-light)",
                      padding: "2px 7px",
                      borderRadius: "4px",
                    }}
                  >
                    {lesson.code}
                  </span>
                  <span>{lesson.number}</span>
                  <span>·</span>
                  <span>Bản SGK KNTT · tr. {lesson.pages}</span>
                </div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "19px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {lesson.title}
                </h3>
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "var(--text-secondary)",
                  }}
                >
                  {lesson.summary}
                </p>
                <div style={{ display: "flex", gap: "16px", fontSize: "13.5px" }}>
                  <Link
                    href={`/hoc-lieu/truc-quan?bai=${lesson.code}`}
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      textDecoration: "underline",
                      textUnderlineOffset: "4px",
                    }}
                  >
                    Mô phỏng 3D
                  </Link>
                  <Link
                    href={`/hoc-lieu?bai=${lesson.code}`}
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Học liệu bài {lesson.code} →
                  </Link>
                </div>
              </div>

              {/* Crisp LaTeX Mathematical Display (Static Editorial Surface) */}
              <div
                className="editorial-surface"
                style={{
                  background: "var(--bg-surface)",
                  padding: "16px 20px",
                  color: "var(--text-primary)",
                }}
              >
                <div style={{ marginBottom: "10px", overflowX: "auto" }}>
                  <LatexMath block math={lesson.latex} />
                </div>
                <div
                  style={{
                    paddingTop: "10px",
                    borderTop: "1px solid var(--border-light)",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <span className="mono-tag" style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    KÍ HIỆU / PHƯƠNG TRÌNH MẪU
                  </span>
                  <LatexMath math={lesson.nuclideExample} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. DANH MỤC PHÂN HỆ THỰC NGHIỆM & SOẠN GIẢNG                      */}
      {/* ================================================================= */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px 16px",
        }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-light)",
            borderRadius: "10px",
            padding: "32px 28px",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <p
              className="mono-tag"
              style={{
                margin: "0 0 6px",
                fontSize: "11.5px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-muted)",
              }}
            >
              DANH MỤC PHÂN HỆ
            </p>
            <h2 style={{ margin: 0, fontSize: "23px", fontWeight: 700, color: "var(--text-primary)" }}>
              Không gian thực nghiệm, tư liệu trực quan và thiết kế bài dạy
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                code: "STUDIO 01",
                tag: "Thực nghiệm 3D",
                title: "Phòng thí nghiệm Mô phỏng 3D",
                desc: "Quan sát trực quan 17 mô phỏng hạt nhân, điều chỉnh thông số thanh điều khiển và lắp ghép kịch bản dạy học.",
                href: "/hoc-lieu/truc-quan",
                cta: "Mở Phòng thí nghiệm 3D →",
              },
              {
                code: "STUDIO 02",
                tag: "Tư liệu & Lịch sử",
                title: "Infographic & Lịch sử Hạt nhân",
                desc: "Hệ thống sơ đồ hóa kiến thức theo từng mục SGK và biên niên sử các công trình Vật lí Hạt nhân thế giới.",
                href: "/gioi-thieu",
                cta: "Xem Infographic & Lịch sử →",
              },
              {
                code: "STUDIO 03",
                tag: "Kế hoạch bài dạy",
                title: "Soạn Giáo án chuẩn Công văn 5512",
                desc: "Biên tập kế hoạch bài dạy 3 giai đoạn cho Bài 21–25, xuất tập tin Word (.docx) và tạo đề kiểm tra theo ma trận.",
                href: "/hoc-lieu/soan-ke-hoach",
                cta: "Mở trình soạn kế hoạch →",
              },
              {
                code: "STUDIO 04",
                tag: "Hỗ trợ tự học",
                title: "Trợ lí Học tập & Đánh giá SRL",
                desc: "Tra cứu công thức chuẩn LaTeX, gợi mở giải bài tập từng bước và hỗ trợ giáo viên thiết kế phiếu học tập.",
                href: "/hoc-lieu/ai",
                cta: "Mở Trợ lí Vật lí 12 →",
              },
            ].map((card) => (
              <div
                key={card.href}
                className="editorial-surface editorial-surface--interactive"
                style={{
                  background: "var(--bg-page)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      className="mono-tag"
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                      }}
                    >
                      {card.code}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-light)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "16.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {card.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {card.desc}
                  </p>
                </div>
                <Link
                  href={card.href}
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                  }}
                >
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </PublicShell>
  );
}
