import { GithubRepo } from "@/types";
import { Star, GitFork, ExternalLink } from "lucide-react";
import Link from "next/link";

export async function getRepos(username: string, page: number = 1): Promise<GithubRepo[]> {
  try {
    const headers: HeadersInit = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Revalidate every 1 hour
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6&page=${page}`, {
      headers,
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      if (res.status === 403) {
        console.warn("GitHub API rate limit exceeded. Add GITHUB_TOKEN to .env.local");
      }
      return [];
    }

    const repos: GithubRepo[] = await res.json();
    
    // Sort by updated_at and filter explicit public
    return repos
      .filter((repo) => repo.visibility === "public")
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()); // Keep pagination boundaries
  } catch (error) {
    console.error("Failed to fetch GitHub repos", error);
    return [];
  }
}

export function GithubPortfolio({ repos }: { repos: GithubRepo[] }) {

  if (!repos.length) {
    return (
      <div className="text-sm text-muted-foreground border border-white/10 rounded-xl p-8 text-center bg-white/5">
        No projects found or unable to load repositories.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.map((repo) => (
        <Link 
          key={repo.id} 
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all duration-300 ease-in-out hover:border-teal-500/30 overflow-hidden"
        >
          {/* Subtle gradient hover effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex flex-col z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg tracking-tight group-hover:text-teal-400 transition-colors">
                {repo.name}
              </h3>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
              {repo.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground z-10">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500/80"></span>
                <span>{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{repo.stargazers_count}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
