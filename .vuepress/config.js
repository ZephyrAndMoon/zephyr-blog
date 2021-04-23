module.exports = {
  title: "ZephyrAndMoon",
  description: "",
  dest: "public",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
    ["link", { rel: "stylesheet", href: "/styles/common.css" }],
    [
      "script",
      {
        src: "/script/index.js",
      },
    ],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ],
  ],
  theme: "reco",
  themeConfig: {
    subSidebar: "auto",
    codeTheme: "tomorrow",
    nav: [
      {
        text: "Home",
        link: "/",
        icon: "reco-home",
      },
      {
        text: "TimeLine",
        link: "/timeline/",
        icon: "reco-date",
      },
      {
        text: "Docs",
        icon: "reco-message",
        items: [
          {
            text: "PersonalEssay",
            link: "/docs/PersonalEssay/",
          },
        ],
      },
      {
        text: "Contact",
        icon: "reco-message",
        items: [
          {
            text: "GitHub",
            link: "https://github.com/recoluan",
            icon: "reco-github",
          },
        ],
      },
    ],
    sidebar: {
      "/docs/PersonalEssay/": [""],
    },
    type: "blog",
    blogConfig: {
      category: {
        location: 2,
        text: "Category",
      },
      tag: {
        location: 3, // 在导航栏菜单中所占的位置
        text: "Tag", // 默认文案 “标签”
      },
    },
    friendLink: [
      {
        title: "风走了以后",
        desc: "This is my Weibo.",
        link: "https://weibo.com/u/3011512391",
        logo:
          "https://markdowncun.oss-cn-beijing.aliyuncs.com/20210411003825.png",
      },
      {
        title: "Zephyr's github",
        desc: "This is my github.",
        link: "https://github.com/ZephyrAndMoon",
        logo:
          "https://markdowncun.oss-cn-beijing.aliyuncs.com/20210411003652.png",
      },
    ],
    logo: "/logo.png",
    search: true,
    searchMaxSuggestions: 10,
    lastUpdated: "Last Updated",
    author: "Zephyr",
    authorAvatar: "/avatar.png",
    record: "xxxx",
    startYear: "2017",
  },
  markdown: {
    lineNumbers: true,
  },
  plugins: [
    [
      "@vuepress-reco/vuepress-plugin-kan-ban-niang",
      {
        theme: ["shizuku"],
        clean: true,
        modelStyle: {
          position: "fixed",
          right: "200px",
          bottom: "0px",
          opacity: "0.9",
          zIndex: 99999,
        },
      },
    ],
  ],
};
