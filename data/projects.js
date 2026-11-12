// 每个 { id: ... } 是一个项目。复制整段可新增；数组顺序就是展示顺序。
// category 是分类；media 中的 type 是媒体类型，两者互不限制。
window.PORTFOLIO_PROJECTS = [
  {
    id: "project-01",
    number: "01",
    title: "间距 / Between spaces",
    year: "2026",
    category: ["Graphic"],
    description: [
      "一个关于间距、秩序与阅读的平面项目。字与字之间的空白，也参与表达。",
      "这是可替换的示例项目。这里可以写创作背景、问题、方法，以及作品最终呈现的形式。每一段文字分别放在一组引号中。"
    ],
    credits: "示例排版素材 · 用于展示作品集结构",
    cover: { type: "image", src: "assets/images/projects/project-01/cover.svg", alt: "间距：蓝灰色排版示例", width: 1400, height: 1000 },
    media: [
      { layout: "full", type: "image", src: "assets/images/projects/project-01/cover.svg", alt: "横向排版全景", width: 1400, height: 1000, caption: "01 / 排版研究 · 示例" },
      { layout: "pair", items: [
        { type: "image", src: "assets/images/projects/project-01/01.svg", alt: "纵向海报一", width: 800, height: 1100 },
        { type: "image", src: "assets/images/projects/project-01/02.svg", alt: "纵向海报二", width: 800, height: 1100 }
      ], caption: "02—03 / 两张并排，保留各自比例" },
      { layout: "text-media", text: ["空白不是空缺。", "这段文字可以记录作品的思考过程，也可以放图像旁注。平面项目里同样可以使用视频。"], items: [
        { type: "video", src: "assets/videos/project-02/preview.mp4", poster: "assets/images/projects/project-02/poster.svg", controls: true, autoplay: false, muted: true, loop: false, width: 960, height: 540, caption: "混合媒体播放示例 · MDN / CC0" }
      ] },
      { layout: "small", type: "image", src: "assets/images/projects/project-01/01.svg", alt: "留白中的小幅海报", width: 800, height: 1100 }
    ]
  },
  {
    id: "project-02",
    number: "02",
    title: "短暂 / A passing moment",
    year: "2026",
    category: ["Motion"],
    description: ["一次关于运动与停留的观察。影像与静帧在同一个项目中交替呈现。", "本项目使用 MDN 的 Flower 开放示例视频测试播放；这里的文字、封面和所有媒体都可以替换。"],
    credits: "视频示例：MDN / Flower，CC0。其余为本地排版占位素材。",
    cover: { type: "video", src: "assets/videos/project-02/preview.mp4", poster: "assets/images/projects/project-02/poster.svg", alt: "花朵在风中轻轻摇动的视频预览", width: 960, height: 540 },
    media: [
      { layout: "video", type: "video", src: "assets/videos/project-02/preview.mp4", poster: "assets/images/projects/project-02/poster.svg", controls: true, autoplay: false, muted: false, loop: false, width: 960, height: 540, caption: "01 / 主视频 · MP4" },
      { layout: "landscape", type: "image", src: "assets/images/projects/project-02/poster.svg", alt: "运动影像项目的标题静帧", width: 960, height: 540 },
      { layout: "triple", items: [
        { type: "image", src: "assets/images/projects/project-01/01.svg", alt: "分镜占位一", width: 800, height: 1100 },
        { type: "image", src: "assets/images/projects/project-01/02.svg", alt: "分镜占位二", width: 800, height: 1100 },
        { type: "image", src: "assets/images/projects/project-04/01.svg", alt: "分镜占位三", width: 800, height: 1100 }
      ], caption: "02—04 / 三幅分镜 · 示例" },
      { layout: "video", type: "video", src: "assets/videos/project-02/main.webm", poster: "assets/images/projects/project-02/poster.svg", controls: false, autoplay: true, muted: true, loop: true, width: 960, height: 540, caption: "05 / 无声循环 · WebM" }
    ]
  },
  {
    id: "project-03",
    number: "03",
    title: "水面之上 / Above the water",
    year: "2026",
    category: ["Photography"],
    description: ["一棵树、一片水面，和被雾气轻轻遮住的距离。", "这是摄影项目的结构示例，同一幅授权照片用于演示不同布局。请替换成自己的系列作品；这里可以写拍摄地点、时间与观察。"],
    credits: "Lonely tree at Fairy lake — © Sergey Pesterev / Wikimedia Commons / CC BY-SA 4.0。图片已缩放。",
    cover: { type: "image", src: "assets/images/projects/project-03/cover.jpg", alt: "雾湖中的孤树与倒影", width: 2400, height: 1316 },
    media: [
      { layout: "full", type: "image", src: "assets/images/projects/project-03/cover.jpg", alt: "雾湖中的孤树与倒影", width: 2400, height: 1316, caption: "01 / Lonely tree at Fairy lake · Sergey Pesterev" },
      { layout: "small", type: "image", src: "assets/images/projects/project-03/cover.jpg", alt: "留白中的摄影作品", width: 2400, height: 1316 },
      { layout: "text-media", text: "在这里写一则拍摄手记。布局的变化不会裁掉原作的边缘。", items: [
        { type: "image", src: "assets/images/projects/project-03/cover.jpg", alt: "摄影手记配图", width: 2400, height: 1316 }
      ] }
    ]
  },
  {
    id: "project-04",
    number: "04",
    title: "未定形 / Open studies",
    year: "2025—2026",
    category: ["Experimental", "Graphic"],
    description: ["一些尚未被归类的形式练习。媒介可以不同，观察可以继续。", "这是实验项目示例，展示竖图、不对称排列，以及图像和文字的自由组合。"],
    credits: "本地示例素材，不代表真实客户或展览项目。",
    cover: { type: "image", src: "assets/images/projects/project-04/01.svg", alt: "未定形：黑白排版实验示例", width: 800, height: 1100 },
    media: [
      { layout: "portrait", type: "image", src: "assets/images/projects/project-04/01.svg", alt: "黑白竖向排版实验", width: 800, height: 1100 },
      { layout: "asymmetric", items: [
        { type: "image", src: "assets/images/projects/project-01/cover.svg", alt: "横向图像实验", width: 1400, height: 1000 },
        { type: "image", src: "assets/images/projects/project-01/02.svg", alt: "竖向图像实验", width: 800, height: 1100 }
      ], caption: "02—03 / 不对称：两种尺度的对话" },
      { layout: "text-media", text: ["过程也是作品的一部分。", "把草图、测试、运动片段和旁注放在一起，保留工作的开放状态。"], items: [
        { type: "image", src: "assets/images/projects/project-04/01.svg", alt: "过程记录示例", width: 800, height: 1100 }
      ] }
    ]
  }
];
