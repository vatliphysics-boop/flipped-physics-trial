import type { CanonicalActivityKey, NuclearPhysicsLessonCode } from "./curriculum";
import type { LearningPhase } from "./learning-phases";

type LearningTask = {
  title: string;
  goal: string;
  work: string;
  product: string;
  criterion: string;
};

type LessonSequence = {
  activity: CanonicalActivityKey;
  materialId: string;
  tasks: Record<LearningPhase, LearningTask>;
};

export const NUCLEAR_SEQUENCES = {
  B21: {
    activity: "rutherford_alpha_scattering", materialId: "system-sim-rutherford",
    tasks: {
      before_class: {
        title: "Dự đoán đường đi của hạt alpha gần hạt nhân",
        goal: "Liên hệ tán xạ với vùng điện tích dương nhỏ của nguyên tử.",
        work: "Chọn mục tiêu tự học, xem video B21 và đọc thí nghiệm tán xạ alpha. Dự đoán chùm đi gần tâm hay xa tâm lệch nhiều hơn. Ghi căn cứ từ sách và một điều còn chưa hiểu về hạt nhân.",
        product: "Một dự đoán có lí do, nguồn đã đọc và một điều chưa hiểu để hỏi khi vào lớp.",
        criterion: "Nêu rõ điều kiện so sánh, hướng thay đổi dự đoán và một câu hỏi cụ thể.",
      },
      in_class: {
        title: "So sánh hai điều kiện tán xạ và giải thích",
        goal: "Dùng đường đi và góc lệch trong mô hình để kiểm tra dự đoán về sự tập trung điện tích dương.",
        work: "Giữ cùng năng lượng, cho hai hạt alpha theo hai điều kiện lệch tâm khác nhau chạy đến màn ghi nhận. Ghi điều kiện và góc tán xạ của mỗi lượt; đổi một tham số rồi kiểm tra lại. Phân biệt góc tán xạ xa với vị trí trên màn hữu hạn. Quan sát cấu trúc carbon ở phần bổ trợ để đọc Z, N, A.",
        product: "Bảng hai điều kiện, hai góc tán xạ và lời giải thích dự đoán đúng hoặc cần sửa.",
        criterion: "Giữ một yếu tố khi so sánh; phân biệt kết quả tính của mô hình với số liệu thí nghiệm thật và nêu giới hạn minh họa.",
      },
      after_class: {
        title: "Đọc kí hiệu một hạt nhân mới",
        goal: "Vận dụng cách đọc kí hiệu sang một nguyên tố khác.",
        work: String.raw`Từ \({}^{16}_{8}\mathrm{O}\), suy ra số proton, neutron và tổng số nucleon. Soát phép tính rồi ghi một điểm đã sửa hoặc một bước em sẽ dùng để tự kiểm tra bài tương tự.`,
        product: "Bộ ba Z, N, A kèm phép tính và kế hoạch kiểm tra lại.",
        criterion: "Phân biệt số khối với số neutron và giải thích đúng cách lấy hiệu.",
      },
    },
  },
  B22: {
    activity: "nuclear_fission", materialId: "system-sim-nuclear-fission",
    tasks: {
      before_class: {
        title: "Dự đoán đại lượng được bảo toàn",
        goal: "Nhận diện hai phép kiểm tra phương trình hạt nhân.",
        work: "Đặt mục tiêu, xem video B22 và đối chiếu với mục phản ứng hạt nhân. Dự đoán tổng số khối và tổng số điện tích sẽ ra sao ở hai vế. Ghi chỗ chưa phân biệt được giữa số khối và khối lượng.",
        product: "Dự đoán hai đại lượng, lí do, nguồn và một thắc mắc.",
        criterion: "Tách phép kiểm tra số nucleon khỏi phép kiểm tra điện tích.",
      },
      in_class: {
        title: "Theo dõi phân hạch và kiểm tra bảo toàn",
        goal: "Đối chiếu thành phần trước, sau phản ứng và ý nghĩa chênh lệch khối lượng nghỉ.",
        work: "Chạy quá trình có neutron tới, tạm dừng ở hạt nhân hợp phần rồi quan sát hai mảnh và neutron sau phân hạch. Đặt lại và so với điều kiện không có neutron tới. Viết hai phép cộng A, Z; đọc Q từ dữ liệu khối lượng và phân biệt Q với động năng từng mảnh.",
        product: "Phương trình, tổng A và Z của hai vế, bảng hai điều kiện và giải thích nguồn năng lượng.",
        criterion: "Tính cả hệ số trước hạt, bảo toàn đủ hai tổng, phân biệt số khối và khối lượng; không gọi chuyển động quy ước là quỹ đạo đo được.",
      },
      after_class: {
        title: "Giải thích độ hụt khối và năng lượng liên kết",
        goal: "Dùng đúng đại lượng và đơn vị trong bài tính năng lượng.",
        work: String.raw`Một hạt nhân có độ hụt khối \(0{,}020\,\mathrm{u}\). Dùng \(1\,\mathrm{u}\,c^2\approx931{,}5\,\mathrm{MeV}\) để tính năng lượng liên kết. Phân biệt năng lượng liên kết và năng lượng liên kết riêng. Tự soát đơn vị và ghi điều cần sửa.`,
        product: "Phép tính có đơn vị và một lời giải thích phân biệt hai đại lượng.",
        criterion: "Đổi đúng từ độ hụt khối sang năng lượng; nêu cần chia cho A để tính năng lượng liên kết riêng.",
      },
    },
  },
  B23: {
    activity: "radioactive_decay_half_life", materialId: "system-sim-half-life",
    tasks: {
      before_class: {
        title: "Dự đoán số hạt nhân mẹ còn lại",
        goal: "Phân biệt sự kiện phân rã đơn lẻ với xu hướng của cả mẫu.",
        work: String.raw`Xem video B23 và đọc mục định luật phóng xạ. Với mẫu 64 hạt ban đầu, dự đoán số hạt còn lại theo kì vọng ở \(t=T\) và \(t=2T\). Ghi nguồn, mức chắc chắn và điều em muốn kiểm chứng.`,
        product: "Hai giá trị dự đoán, lí do và một câu hỏi.",
        criterion: "Dùng đúng mốc thời gian và nêu đây là kì vọng của mẫu, không phải thời điểm của từng hạt.",
      },
      in_class: {
        title: "Đọc bảng bán rã và kiểm chứng quy luật",
        goal: "Kiểm chứng quy luật kì vọng bằng bảng và đồ thị mô hình.",
        work: String.raw`Chọn chu kì bán rã của mô hình và ghi số hạt kì vọng ở \(0,T,2T\). So sánh tỉ phần \(\frac{N}{N_0}\) với dự đoán của mẫu 64 hạt vì hai mẫu có thể khác số hạt ban đầu. Giữ số hạt ban đầu và đổi T để so sánh đường cong. Trao đổi với bạn vì sao đồ thị không dự báo thời điểm phân rã của từng hạt.`,
        product: "Bảng ba mốc có điều kiện mô hình, so sánh tỉ phần với dự đoán và một kết luận cá nhân.",
        criterion: "Phân biệt số mô phỏng từng lượt, giá trị kì vọng và dữ liệu đo thực.",
      },
      after_class: {
        title: "Vận dụng định luật phóng xạ và tự soát lời giải",
        goal: "Từ tỉ số độ phóng xạ suy ra số chu kì bán rã.",
        work: String.raw`Mẫu của cùng một đồng vị có \(H(t)=\frac{1}{8}H_0\). Tìm số chu kì đã qua; giải thích điều kiện để dùng cùng tỉ số cho số hạt nhân mẹ. Tự soát bước suy luận và ghi việc sẽ làm khi còn nhầm.`,
        product: "Lời giải có hệ thức, điều kiện áp dụng và một ghi chú tự đánh giá.",
        criterion: "Phân biệt số hạt còn lại với số đã phân rã và giữ cùng hằng số phóng xạ.",
      },
    },
  },
  B24: {
    activity: "nuclear_power_energy_flow", materialId: "system-sim-nuclear-power",
    tasks: {
      before_class: {
        title: "Dự đoán đường đi của năng lượng trong nhà máy",
        goal: "Nhận diện vai trò của phân hạch, hơi và máy phát.",
        work: "Đặt mục tiêu, xem video B24 rồi phác thảo thứ tự các khâu từ phân hạch đến điện. Ghi một nhầm lẫn có thể có giữa thanh điều khiển và bộ sinh hơi.",
        product: "Sơ đồ dự đoán, nguồn đã dùng và một câu hỏi cần hỏi nhóm.",
        criterion: "Phân biệt khâu sinh nhiệt với khâu tạo điện, ghi rõ điều còn chưa chắc.",
      },
      in_class: {
        title: "Theo dõi sơ đồ phát điện và giải thích từng khâu",
        goal: "Dùng mô hình nhà máy để giải thích chuyển hóa năng lượng.",
        work: "Theo dõi sơ đồ phát điện. Ghi thiết bị và dạng năng lượng vào/ra. So sánh hai mức cắm thanh điều khiển theo hướng dẫn của mô hình và giải thích ảnh hưởng lên hệ số nhân neutron. Trao đổi rồi viết kết luận cá nhân.",
        product: "Sơ đồ có chú giải nhiệt, cơ, điện và một câu về hấp thụ neutron.",
        criterion: "Sắp đúng chuỗi chuyển hóa và tách kiểm soát phân hạch khỏi phát điện.",
      },
      after_class: {
        title: "So sánh hai ứng dụng công nghệ hạt nhân",
        goal: "Nêu cơ chế và giới hạn của ứng dụng đã đọc.",
        work: "Chọn một ứng dụng y học và một ứng dụng trong công nghiệp hoặc nông nghiệp. Tóm tắt vai trò bức xạ, lợi ích và một giới hạn trong mỗi trường hợp. Ghi nguồn, tự kiểm tra rồi nêu điều cần hỏi thêm.",
        product: "Bảng hai ứng dụng, có nguồn và một bước kiểm chứng tiếp theo.",
        criterion: "Giải thích được vì sao dùng bức xạ trong từng ứng dụng, không suy rộng từ trường hợp này sang trường hợp khác.",
      },
    },
  },
  B25: {
    activity: "nuclear_physics_practice_lab", materialId: "system-sim-practice-lab",
    tasks: {
      before_class: {
        title: "Lập kế hoạch giải một bài tập tổng hợp",
        goal: "Chọn hệ thức theo đại lượng đã cho và cần tìm.",
        work: String.raw`Xem video B25. Quan sát Bảng 25.1 với độ phóng xạ ban đầu \(151\,\mathrm{Bq}\). Dự đoán cách tìm chu kì bán rã mà không cần khớp toàn bộ đồ thị. Chọn một khó khăn cá nhân và nguồn hỗ trợ.`,
        product: "Kế hoạch đọc trục, mốc cần tìm và một điều chưa hiểu.",
        criterion: "Nêu đại lượng, đơn vị và thao tác dự kiến trước khi tính.",
      },
      in_class: {
        title: "Giải bài tập và kiểm tra kết quả theo hai cách",
        goal: "Kết nối số đọc trên đồ thị với định luật bán rã.",
        work: "Ghi hai điểm kẹp mức nửa ban đầu của Bảng 25.1 rồi ước lượng chu kì bán rã. Đối chiếu đường lí thuyết, trao đổi nếu có sai khác. Hoàn thành hai phần luyện tập phương trình và năng lượng theo hướng dẫn trong phòng luyện tập.",
        product: "Cặp số đọc có đơn vị, lời giải, ghi chú đối chiếu và một điều tự soát từ hai phần luyện tập.",
        criterion: "Dùng đúng trục, tách kết quả đọc gần đúng với phép tính từ dữ kiện.",
      },
      after_class: {
        title: "Vận dụng và điều chỉnh cách giải",
        goal: "Chuyển phương pháp sang một bộ dữ kiện mới.",
        work: String.raw`Một mẫu có \(H_0=96\,\mathrm{Bq}\), sau \(60\,\mathrm{s}\) còn \(12\,\mathrm{Bq}\). Tìm chu kì bán rã, kiểm tra bằng cách thế ngược. Ghi bước dễ nhầm và kế hoạch ôn tập.`,
        product: "Lời giải, phép kiểm tra ngược và bước tự học tiếp theo.",
        criterion: "Chỉ rõ số lần giảm một nửa, nêu kết quả có đơn vị và kiểm tra lại bằng mô hình.",
      },
    },
  },
} satisfies Record<NuclearPhysicsLessonCode, LessonSequence>;

export function getNuclearSequence(code: string) {
  return Object.hasOwn(NUCLEAR_SEQUENCES, code) ? NUCLEAR_SEQUENCES[code as NuclearPhysicsLessonCode] : undefined;
}

export function formatLearningTask(task: LearningTask) {
  return `Mục tiêu: ${task.goal}\n\nNhiệm vụ: ${task.work}\n\nSản phẩm cần nộp: ${task.product}\n\nTiêu chí hoàn thành: ${task.criterion}`;
}

export const EVIDENCE_PROMPTS = {
  before_class: ["Mục tiêu và dự đoán", "Kế hoạch, ghi chép chuẩn bị và nguồn đã dùng", "Điều chưa hiểu hoặc cách em sẽ tìm hỗ trợ"],
  in_class: ["Dự đoán hoặc kế hoạch quan sát", "Số liệu, điều kiện, kết quả và giải thích", "Đối chiếu với dự đoán và điểm cần kiểm chứng"],
  after_class: ["Kế hoạch hoặc cách em chọn lời giải", "Lời giải và bằng chứng tự kiểm tra", "Điều đã sửa và hành động tự học tiếp theo"],
} satisfies Record<LearningPhase, [string, string, string]>;
