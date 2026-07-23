/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://czy-blog.cc.cd", // 部署后替换为你的域名
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/api/*", "/drive"],
  robotsTxtOptions: {
    additionalSitemaps: [],
  },
};
