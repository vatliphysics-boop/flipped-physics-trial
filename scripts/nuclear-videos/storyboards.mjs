export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const curriculum = (pages) => `SGK Vật lí 12 KNTT · bản mẫu 01/2024 · tr. ${pages}`;
const openStax = "OpenStax University Physics 3 · Chương 10";
const iaea = "IAEA · What Is Nuclear Energy? · Nuclear Medicine";
const nuclides = "IAEA LiveChart of Nuclides";
const shot = (seconds, kind, title, body, caption, extra = {}) => ({
  seconds, kind, title, body, caption, motionFrames: 64, ...extra,
});

export const LESSONS = {
  B21: {
    name: "Cấu trúc hạt nhân",
    theme: "CHỌN ĐIỀU KIỆN · QUAN SÁT · GIẢI THÍCH",
    sources: [curriculum("91–95"), openStax, "NIST CODATA 2022 · hạt alpha"],
    shots: [
      shot(12, "rutherford", "Nếu hạt alpha đi gần tâm?", "Hai hạt alpha có cùng động năng xa tâm. Chỉ thay đổi tham số va chạm, tức khoảng cách từ đường tới ban đầu đến tâm vàng.", "Dự đoán hạt nào lệch nhiều hơn khi động năng như nhau.", { mode: "setup", formula: String.raw`1\,\mathrm{zs}=10^{-21}\,\mathrm{s}` }),
      shot(12, "rutherford", "Theo dõi lượt A", "Cho hạt alpha đi theo hướng ban đầu cách tâm 90 fm. Quan sát quỹ đạo đổi hướng dưới lực đẩy điện.", "Vòng đầu dò ghi vị trí hạt đi qua. Góc lệch xét hướng tới và hướng đi xa tâm.", { mode: "run", fullMotion: true }),
      shot(12, "rutherford", "Giữ năng lượng, đổi đường tới", "Đặt hai lượt trên cùng đồng hồ. Lượt B hướng gần tâm hơn, nên lực đẩy có thể đổi hướng chuyển động mạnh hơn.", "Lượt A lệch khoảng 18 độ. Lượt B lệch khoảng 110 độ. Hai lượt minh họa không cho tần suất tán xạ.", { mode: "compare", fullMotion: true, resultCue: 1 }),
      shot(12, "symbol", "Đọc kí hiệu hạt nhân", "Tán xạ góc lớn cho thấy điện tích dương tập trung trong vùng nhỏ. Trong kí hiệu hạt nhân, A đếm nucleon và Z đếm proton.", "Trong kí hiệu carbon-12, số 12 nằm trên, số 6 nằm dưới và C là kí hiệu nguyên tố.", { isotope: "C12", formula: "N=A-Z=12-6=6" }),
      shot(12, "nucleus", "Cùng Z, khác N", "Các đồng vị của cùng nguyên tố có cùng số proton. Carbon-13 có nhiều hơn carbon-12 một neutron.", "Số proton vẫn là 6. Vị trí và màu của quả cầu theo quy ước minh họa.", { isotope: "C13", view: 0.9, formula: String.raw`{}^{13}_{6}\mathrm{C}\colon N=13-6=7` }),
      shot(12, "recap", "Tự kiểm tra", "Nêu dấu hiệu hạt nhân tích điện dương trong thí nghiệm. Sau đó tính số neutron của carbon-14, biết Z bằng 6.", "Trong thí nghiệm lá vàng, phần lớn hạt đi gần thẳng. Một số rất ít lệch góc lớn.", { formula: "N=14-6=8", resultCue: 1, takeaways: ["Góc tán xạ", "Z xác định nguyên tố", "A đếm nucleon"] }),
    ],
  },
  B22: {
    name: "Phản ứng hạt nhân và năng lượng liên kết",
    theme: "KÍCH PHÁT · BẢO TOÀN · NĂNG LƯỢNG",
    sources: [curriculum("96–103"), "AME2020 · IAEA Atomic Mass Data Center", openStax],
    shots: [
      shot(12, "energy", "Năng lượng liên kết", "Hạt nhân liên kết nhẹ hơn các nucleon tự do cộng lại. Năng lượng liên kết là năng lượng cần cấp để tách hoàn toàn hạt nhân.", "Độ hụt khối nhân bình phương tốc độ ánh sáng cho năng lượng liên kết.", { formula: String.raw`E_{\mathrm{lk}}=\Delta m c^2,\qquad E_{\mathrm{lkr}}=\frac{E_{\mathrm{lk}}}{A}` }),
      shot(12, "fissionProcess", "Khi có neutron tới", "Bắt đầu bằng uranium-235. Theo dõi neutron tới, hạt nhân kích thích biến dạng và các sản phẩm tách ra.", "Một kênh tạo yttri-95, iốt-138 và 3 neutron. Sản phẩm thực tế có thể thuộc kênh khác.", { mode: "run", fullMotion: true, resultCue: 1 }),
      shot(12, "fissionProcess", "Nếu bỏ neutron tới?", "Giữ nguyên uranium-235 và bỏ tác nhân tới. Tiến trình phân hạch cảm ứng vừa quan sát chưa khởi phát trong điều kiện này.", "So sánh điều kiện kích phát của chính kênh minh họa với lượt trước.", { mode: "no-neutron" }),
      shot(12, "fissionResults", "Đối chiếu hai vế", "Tính tổng số khối và điện tích. So sánh tổng khối lượng trước và sau để tính năng lượng tỏa ra của kênh.", "Cả hai vế có 236 nucleon và điện tích theo đơn vị e bằng 92. Tổng khối lượng giảm.", { formula: String.raw`{}^{235}_{92}\mathrm{U}+{}^1_0\mathrm n\to{}^{95}_{39}\mathrm Y+{}^{138}_{53}\mathrm I+3{}^1_0\mathrm n` }),
      shot(12, "recap", "Dùng lại hai phép kiểm tra", "Hãy kiểm tra hai tổng trong một phản ứng tổng hợp khác. Đơteri và triti tạo helium-4 và một neutron.", "Phân hạch tách hạt nhân nặng. Tổng hợp gộp các hạt nhân nhẹ. Cả hai phải bảo toàn số nucleon và điện tích.", { formula: String.raw`{}^{2}_{1}\mathrm H+{}^{3}_{1}\mathrm H\to{}^{4}_{2}\mathrm{He}+{}^{1}_{0}\mathrm n`, resultCue: 1, takeaways: ["Tổng A bằng 5", "Tổng Z bằng 2", "Nhớ hệ số trước hạt"] }),
    ],
  },
  B23: {
    name: "Hiện tượng phóng xạ",
    theme: "ĐẶT THAM SỐ · ĐẾM HẠT · SO KÌ VỌNG",
    sources: [curriculum("104–113"), openStax, nuclides],
    shots: [
      shot(12, "decayProcess", "Hai mẫu có cùng số hạt", "Mỗi lượt mô phỏng có 64 hạt nhân mẹ. Dùng công thức cho số hạt còn lại theo kì vọng.", "Hai lượt giữ cùng số hạt ban đầu và cùng seed. Chu kì bán rã là tham số thay đổi.", { mode: "setup", formula: String.raw`N(t)=N_0\,2^{-\frac{t}{T}}` }),
      shot(12, "decayProcess", "Theo dõi lượt A", "Đặt chu kì bán rã 20 giây. Mỗi chấm mờ đi khi hạt nhân đó phân rã. Đếm số hạt mẹ còn lại theo đồng hồ mô hình.", "Hạt nhân không phân rã cùng lúc. Mỗi lượt có thể cho kết quả khác khi thay seed.", { mode: "run", fullMotion: true }),
      shot(12, "decayProcess", "Đổi chu kì, giữ cùng mốc", "Lượt B có chu kì 40 giây. Ở cùng mốc 40 giây, số hạt còn lại của lượt này nhiều hơn lượt A.", "Trong lượt minh họa, A còn 20 hạt và B còn 35 hạt. Đây là kết quả mô phỏng của từng mẫu.", { mode: "compare", fullMotion: true, resultCue: 1 }),
      shot(12, "decayProcess", "Mẫu và kì vọng", "So chấm kết quả của từng mẫu với đường kì vọng. Dùng quy luật để mô tả số hạt còn lại trung bình.", "Ở mốc 40 giây, hai giá trị kì vọng là 16 và 32. Một lượt mô phỏng có thể cho số khác.", { mode: "results", formula: String.raw`\lambda=\frac{\ln 2}{T},\qquad H(t)=\lambda N(t)` }),
      shot(12, "recap", "Sau hai chu kì thì sao?", "Hãy dự đoán phần hạt nhân mẹ còn lại theo kì vọng sau hai chu kì. Nhắc lại một cách giảm nguy cơ chiếu xạ.", "Còn một phần tư theo kì vọng. Giảm thời gian, tăng khoảng cách và dùng che chắn phù hợp với nguồn bức xạ.", { formula: String.raw`\frac{N(2T)}{N_0}=\left(\frac12\right)^2=\frac14`, resultCue: 1, takeaways: ["Thời gian", "Khoảng cách", "Che chắn"] }),
    ],
  },
  B24: {
    name: "Công nghiệp hạt nhân",
    theme: "ĐIỀU KHIỂN · SO THẾ HỆ · CHUYỂN HÓA",
    sources: [curriculum("114–118"), iaea, "U.S. NRC · Pressurized Water Reactors"],
    shots: [
      shot(12, "reactorProcess", "Thanh điều khiển tác động ở đâu?", "Thanh điều khiển hấp thụ neutron. Thử thay độ cắm để quan sát phản ứng dây chuyền qua các thế hệ của mô hình.", "Ba mức cắm 0, 50 và 100 phần trăm chỉ là các điều kiện quy ước.", { mode: "setup" }),
      shot(12, "reactorProcess", "Theo dõi khi rút thanh", "Đặt mức cắm quy ước bằng không. Đọc chỉ số kì vọng ở mỗi thế hệ và quan sát xu hướng.", "Khi k lớn hơn 1, chỉ số kì vọng tăng từ thế hệ này sang thế hệ sau.", { mode: "run", fullMotion: true }),
      shot(12, "reactorProcess", "So sánh ba mức cắm", "Đặt ba lượt cạnh nhau, cùng chỉ số ban đầu bằng 1. So sánh kết quả ở thế hệ thứ tư.", "Cắm sâu hơn làm k giảm trong mô hình. Các đường có thể tăng, giữ nguyên hoặc giảm.", { mode: "compare", fullMotion: true, resultCue: 1, formula: String.raw`I_g=k^g,\qquad I_0=1` }),
      shot(12, "reactorFlow", "Nhiệt thành điện như thế nào?", "Theo dõi lò nước áp lực từ lõi lò, bộ sinh hơi, tua-bin và máy phát đến bình ngưng. Hai vòng nước trao đổi nhiệt qua thành ống.", "Dòng hơi làm quay tua-bin. Máy phát nhận chuyển động quay và tạo điện năng.", { fullMotion: true }),
      shot(12, "recap", "Giải thích hai chức năng", "Thanh điều khiển thay đổi phản ứng dây chuyền. Bộ sinh hơi trao đổi nhiệt. Hãy chỉ rõ hai chức năng trên sơ đồ.", "Bức xạ còn có ứng dụng trong y học, sinh học và bảo quản thực phẩm.", { takeaways: ["Hấp thụ neutron", "Truyền nhiệt giữa hai vòng", "Nhiệt → Cơ → Điện"] }),
    ],
  },
  B25: {
    name: "Bài tập về vật lí hạt nhân",
    theme: "ĐỌC DỮ LIỆU · THỬ GIẢ THUYẾT · ĐỐI CHIẾU",
    sources: [curriculum("119–122"), openStax, nuclides],
    shots: [
      shot(12, "activityProcess", "Đọc Bảng 25.1", "Độ phóng xạ ban đầu là 151 Bq. Tìm hai mốc đo nằm hai bên mức một nửa ban đầu để khoanh khoảng bán rã.", "Mức 75,5 Bq nằm giữa 85 Bq tại 30 giây và 55 Bq tại 60 giây.", { mode: "setup", formula: String.raw`\frac{H_0}{2}=75{,}5\,\mathrm{Bq}` }),
      shot(12, "activityProcess", "Thử chu kì 40 giây", "Giữ độ phóng xạ ban đầu từ bảng. Tính đường lí thuyết với chu kì 40 giây rồi đọc các điểm SGK cùng trục thời gian.", "Đường lí thuyết do công thức tạo ra. Các chấm là dữ liệu giữ nguyên từ Bảng 25.1.", { mode: "run", fullMotion: true, formula: String.raw`H(t)=H_0\,2^{-\frac{t}{T}}` }),
      shot(12, "activityProcess", "Thử thêm chu kì 60 giây", "Đổi chu kì thử lên 60 giây. Đặt hai đường trên cùng đồ thị để thấy khác biệt tại cùng một mốc thời gian.", "Với cùng độ phóng xạ ban đầu, chu kì dài hơn cho đường giảm chậm hơn.", { mode: "compare", fullMotion: true }),
      shot(12, "activityProcess", "Đối chiếu tại 30 giây", "So sánh hai dự báo với 85 Bq ghi trong bảng ở cùng mốc. Nội suy tuyến tính giữa hai điểm kẹp mức nửa cho khoảng 39,5 giây.", "Tại 30 giây, mô hình cho khoảng 89,8 Bq và 106,8 Bq. Đó là dự báo, không phải hai phép đo.", { mode: "results", formula: String.raw`T_{\mathrm{lin}}\approx39{,}5\,\mathrm{s}` }),
      shot(12, "recap", "Giải thích độ lệch", "Vì sao kết quả đọc gần đúng có thể khác đường lí thuyết? Nêu cách em ghi nguồn và giới hạn của phép nội suy.", "Chỉ kết luận theo dữ liệu đang có. Giữ riêng số đo, ước lượng từ đồ thị và giá trị thử của mô hình.", { takeaways: ["Đọc đúng trục", "Giữ số đo SGK", "Nêu cách ước lượng"] }),
    ],
  },
};

export function timeline(lesson, narrationScenes = null) {
  if (narrationScenes !== null && (!Array.isArray(narrationScenes) || narrationScenes.length !== lesson.shots.length)) {
    throw new Error("Số cảnh lời đọc phải khớp kịch bản hình.");
  }

  let from = 0;
  return lesson.shots.map((item, sceneIndex) => {
    const narration = narrationScenes?.[sceneIndex];
    const duration = narration ? narration.durationFrames : item.seconds * FPS;
    if (narrationScenes && (narration?.sceneIndex !== sceneIndex || !Number.isInteger(duration) || duration < item.motionFrames)) {
      throw new Error(`Mốc cảnh ${sceneIndex + 1} sai thứ tự hoặc ngắn hơn phần chuyển động.`);
    }
    const cues = narration ? narration.cues : [{ from: 0, duration, text: item.caption }];
    if (!Array.isArray(cues) || cues.length === 0) throw new Error(`Cảnh ${sceneIndex + 1} chưa có phụ đề.`);
    let end = 0;
    for (const cue of cues) {
      if (!Number.isInteger(cue.from) || !Number.isInteger(cue.duration) ||
          cue.from < end || cue.duration < 1 || cue.from + cue.duration > duration ||
          typeof cue.text !== "string" || !cue.text.trim() || /[\r\n]/.test(cue.text)) {
        throw new Error(`Phụ đề cảnh ${sceneIndex + 1} không nằm trọn trong cảnh hoặc bị chồng thời gian.`);
      }
      end = cue.from + cue.duration;
    }
    const processEndFrame = item.fullMotion
      ? Math.max(item.motionFrames - 1, cues[item.resultCue]?.from ?? duration - FPS - 1)
      : null;
    const motionFrames = processEndFrame === null ? item.motionFrames : processEndFrame + 1;
    const resultFrame = item.kind === "recap" && item.resultCue !== undefined
      ? cues[item.resultCue]?.from ?? Math.floor(duration / 2) : null;
    const scene = { ...item, from, duration, motionFrames, processEndFrame, resultFrame, cues };
    from += duration;
    return scene;
  });
}

export function durationInFrames(lesson, narrationScenes = null) {
  return timeline(lesson, narrationScenes).reduce((sum, scene) => sum + scene.duration, 0);
}

export function captionAt(scene, frame) {
  return scene.cues.find(cue => frame >= cue.from && frame < cue.from + cue.duration)?.text ?? "";
}

export function sceneRenderFrames(scene) {
  const frames = new Set(Array.from({ length: scene.motionFrames }, (_, index) => index));
  if (scene.resultFrame !== null) frames.add(scene.resultFrame);
  for (const cue of scene.cues) {
    frames.add(cue.from);
    if (cue.from + cue.duration < scene.duration) frames.add(cue.from + cue.duration);
  }
  return [...frames].sort((a, b) => a - b).map(frame => scene.from + frame);
}

const captionTime = (frame) => new Date(Math.round(frame * 1000 / FPS)).toISOString().slice(11, 23);
const escapeCaption = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function captionsVtt(scenes) {
  return "WEBVTT\n\n" + scenes.flatMap(scene => scene.cues.map(cue =>
    `${captionTime(scene.from + cue.from)} --> ${captionTime(scene.from + cue.from + cue.duration)}\n${escapeCaption(cue.text)}\n`
  )).join("\n");
}
