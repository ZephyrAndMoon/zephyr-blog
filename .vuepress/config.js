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
    // subSidebar: "auto",
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
            text: "浏览器工作原理与实践",
            link: "/docs/HowBrowsersWorkAndPractice/",
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
      "/docs/HowBrowsersWorkAndPractice/": [
        {
          title: "宏观视角上的浏览器",
          collapsable: true,
          children: [
            "lesson01",
            "lesson02",
            "lesson03",
            "lesson04",
            "lesson05",
            "lesson06",
          ],
        },
        {
          title: "浏览器中JavaScript的执行机制",
          collapsable: true,
          children: [
            "lesson07",
            "lesson08",
            "lesson09",
            "lesson10",
            "lesson11",
          ],
        },
        {
          title: "V8工作原理",
          collapsable: true,
          children: ["lesson12", "lesson13", "lesson14"],
        },
        {
          title: "浏览器中的页面循环系统",
          collapsable: true,
          children: [
            "lesson15",
            "lesson16",
            "lesson17",
            "lesson18",
            "lesson19",
            "lesson20",
          ],
        },
        {
          title: "浏览器中的页面",
          collapsable: true,
          children: [
            "lesson21",
            "lesson22",
            "lesson23",
            "lesson24",
            "lesson25",
            "lesson26",
            "lesson27",
            "lesson28",
          ],
        },
        {
          title: "浏览器中的网络",
          collapsable: true,
          children: [
            "lesson29",
            "lesson30",
            "lesson31",
            "lesson32",
            "lesson33",
            "lesson34",
            "lesson35",
            "lesson36",
          ],
        },
        // {
        //   title: "Vue32.0",
        //   collapsable: false,
        //   children: [
        //     "lesson01",
        //     "lesson02",
        //     "lesson03",
        //     "lesson04",
        //     "lesson05",
        //     "lesson06",
        //   ],
        // },
      ],
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
        logo: "https://markdowncun.oss-cn-beijing.aliyuncs.com/20210411003825.png",
      },
      {
        title: "Zephyr's github",
        desc: "This is my github.",
        link: "https://github.com/ZephyrAndMoon",
        logo: "https://markdowncun.oss-cn-beijing.aliyuncs.com/20210411003652.png",
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
