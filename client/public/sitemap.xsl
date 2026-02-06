<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            max-width: 75rem;
            margin: 0 auto;
            padding: 2rem;
          }
          a {
            color: #0580f2;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }
          p {
            color: #666;
            margin-bottom: 2rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          th {
            text-align: left;
            padding: 1rem;
            border-bottom: 1px solid #ddd;
            background-color: #f9f9f9;
            font-weight: 600;
          }
          td {
            padding: 1rem;
            border-bottom: 1px solid #ddd;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .count {
            background: #eee;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p>
          This is an XML Sitemap, meant for consumption by search engines.
          <br/>
          You can find more information about XML sitemaps on <a href="http://sitemaps.org">sitemaps.org</a>.
        </p>
        <p>
          This sitemap contains <span class="count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span> URLs.
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Priority</th>
              <th>Change Frequency</th>
              <th>Last Modified</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td>
                  <xsl:value-of select="sitemap:priority"/>
                </td>
                <td>
                  <xsl:value-of select="sitemap:changefreq"/>
                </td>
                <td>
                  <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
