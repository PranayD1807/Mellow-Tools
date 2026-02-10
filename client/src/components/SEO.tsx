import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export default function SEO({
    title = "Mellow Tools | Friendly Tools for Text Templates and Notes",
    description = "Mellow Tools - A collection of friendly, useful tools like text templates, notes, and more to enhance your productivity effortlessly.",
    keywords = "productivity tools, text templates, notes, job tracker, bookmarks, developer tools",
    image = "/og-image.png",
    url = "https://mellow-tools.vercel.app",
    type = "website",
}: SEOProps) {
    const siteTitle = "Mellow Tools";
    const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

    // Ensure image is an absolute URL for OG/Twitter
    const absoluteImageUrl = image.startsWith("http")
        ? image
        : `${url}${image.startsWith("/") ? "" : "/"}${image}`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImageUrl} />

            {/* Canonical */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
}
