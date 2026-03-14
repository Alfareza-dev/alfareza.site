import { GithubPortfolio, getRepos } from "@/components/github-portfolio";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = params.page;
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  const repos = await getRepos("Alfareza-dev", currentPage);
  const isNextDisabled = repos.length < 6; // Natively disables next button if page fetched < 6 repos

  return (
    <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Selected Work
        </h1>
        <p className="text-muted-foreground text-lg">
          A showcase of my recent projects powered by the GitHub API. 
        </p>
      </div>
      
      <GithubPortfolio repos={repos} />

      {repos.length > 0 && (
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
          <Link
            href={currentPage <= 1 ? "#" : `/portfolio?page=${currentPage - 1}`}
            className={`flex items-center gap-2 px-4 py-2 font-sans font-medium text-sm rounded-md transition-colors ${
              currentPage <= 1
                ? "text-muted-foreground bg-transparent cursor-not-allowed opacity-50"
                : "text-white bg-white/5 hover:bg-white/10 hover:text-teal-400"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Link>
          
          <span className="text-sm text-muted-foreground font-sans">
            Page {currentPage}
          </span>
          
          <Link
            href={isNextDisabled ? "#" : `/portfolio?page=${currentPage + 1}`}
            className={`flex items-center gap-2 px-4 py-2 font-sans font-medium text-sm rounded-md transition-colors ${
              isNextDisabled
                ? "text-muted-foreground bg-transparent cursor-not-allowed opacity-50"
                : "text-white bg-white/5 hover:bg-white/10 hover:text-teal-400"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
