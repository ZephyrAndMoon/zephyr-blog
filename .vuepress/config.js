const path = require("path");
const basePath = path.resolve(__dirname, "./");
module.exports = {
  title: "风走了以后",
  description: "",
  dest: "zephyr-blog",
  base: "/", // 设置站点根路径
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
      "link",
      {
        rel: "stylesheet",
        href: "/styles/common.css",
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
        icon: "zephyr-message",
        items: [
          {
            text: "GitHub",
            link: "https://github.com/ZephyrAndMoon",
            icon: "zephyr-github",
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
    record: "闽ICP备2021019076号",
    cyberSecurityRecord: "闽公网安备 35011102350771号",
    cyberSecurityLink:
      "http://www.beian.gov.cn/portal/index.do?spm=a2c4g.11186623.0.0.15424f58vVcp9m&file=index.do",
    startYear: "2021",
    recordLink: "http://beian.miit.gov.cn/",
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
          right: "40px",
          bottom: "0px",
          zIndex: 99999,
        },
      },
    ],
  ],
};
