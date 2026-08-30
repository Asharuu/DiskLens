'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Mail, Menu, SendHorizonal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Compatibility Link component for standard React / Vite or Next.js
const Link = ({ href, children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Smart Advisor', href: '#advisor' },
    { name: 'Security', href: '#security' },
    { name: 'Documentation', href: 'https://github.com/Asharuu/DiskLens' },
]

export function HeroSection() {
    const [menuState, setMenuState] = useState(false)
    return (
        <>
            <header>
                <nav
                    data-state={menuState && 'active'}
                    className="group fixed z-20 w-full border-b border-dashed border-slate-800 bg-[#0a0f1d]/80 backdrop-blur-md md:relative">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                            <div className="flex w-full justify-between lg:w-auto">
                                <Link
                                    href="/"
                                    aria-label="home"
                                    className="flex items-center space-x-2">
                                    <Logo />
                                </Link>

                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState === true ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden text-slate-300">
                                    <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>

                            <div className="bg-[#0f172a] group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-slate-800 p-6 shadow-2xl shadow-indigo-950/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                                <div className="lg:pr-4">
                                    <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                                        {menuItems.map((item, index) => (
                                            <li key={index}>
                                                <Link
                                                    href={item.href}
                                                    className="text-slate-400 hover:text-indigo-400 block duration-150 font-medium">
                                                    <span>{item.name}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:border-slate-800 lg:pl-6">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm">
                                        <Link href="https://github.com/Asharuu/DiskLens">
                                            <span>GitHub</span>
                                        </Link>
                                    </Button>

                                    <Button
                                        asChild
                                        size="sm">
                                        <Link href="#start">
                                            <span>Quick Start</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main>
                <section className="overflow-hidden relative">
                    <div className="relative mx-auto max-w-5xl px-6 py-20 lg:py-16">
                        <div className="lg:flex lg:items-center lg:gap-12">
                            <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
                                <Link
                                    href="https://github.com/Asharuu/DiskLens"
                                    className="rounded-lg mx-auto flex w-fit items-center gap-2 border border-slate-800 bg-slate-900/60 p-1 pr-3 lg:ml-0 text-slate-300 hover:border-indigo-500/40 transition">
                                    <span className="bg-indigo-500/20 text-indigo-300 rounded px-2 py-0.5 text-xs font-bold">New</span>
                                    <span className="text-xs font-semibold">DiskLens v1.0 Released</span>
                                    <span className="bg-slate-700 block h-4 w-px"></span>

                                    <ArrowRight className="size-3.5 text-indigo-400" />
                                </Link>

                                <h1 className="mt-8 text-balance text-4xl font-black md:text-5xl xl:text-5xl text-white tracking-tight leading-tight">
                                    Visual Disk Analyzer & Safe Cleanup Advisor
                                </h1>
                                <p className="mt-6 text-slate-400 text-sm md:text-base leading-relaxed">
                                    Petakan penggunaan storage drive Windows Anda, temukan cache tersembunyi puluhan gigabyte, dan bersihkan file sampah secara 100% aman dengan panduan AI Smart Advisor.
                                </p>

                                <div>
                                    <form
                                        onSubmit={(e) => e.preventDefault()}
                                        className="mx-auto my-8 max-w-sm lg:my-10 lg:ml-0 lg:mr-auto">
                                        <div className="bg-slate-900/90 relative grid grid-cols-[1fr_auto] items-center rounded-2xl border border-slate-800 pr-1 shadow-lg shadow-indigo-950/20 focus-within:ring-2 focus-within:ring-indigo-500/50">
                                            <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-slate-500" />

                                            <input
                                                placeholder="C:\\Users\\... atau direktori target"
                                                className="h-12 w-full bg-transparent pl-11 pr-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none"
                                                type="text"
                                            />

                                            <div className="md:pr-1 lg:pr-0">
                                                <Button
                                                    aria-label="submit"
                                                    size="sm"
                                                >
                                                    <span className="hidden md:block text-xs font-bold">Scan Folder</span>
                                                    <SendHorizonal
                                                        className="relative mx-auto size-4 md:hidden"
                                                        strokeWidth={2}
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                    </form>

                                    <ul className="flex items-center space-x-4 text-xs font-semibold text-slate-400 justify-center lg:justify-start">
                                        <li className="flex items-center space-x-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            <span>Win32 Native Speed</span>
                                        </li>
                                        <li className="flex items-center space-x-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                            <span>Smart 3-Tier Safety</span>
                                        </li>
                                        <li className="flex items-center space-x-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                            <span>100% Open Source</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Background glowing illustration & card */}
                        <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3 pointer-events-none overflow-hidden opacity-60">
                            <div aria-hidden className="absolute z-[1] inset-0 bg-gradient-to-r from-[#0a0f1d] via-[#0a0f1d]/80 to-transparent" />
                            <div className="relative flex justify-end">
                                <img
                                    className="rounded-3xl border border-slate-800/80 shadow-2xl max-w-[650px] w-full object-cover"
                                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80"
                                    alt="DiskLens High-Tech Visualization"
                                    width={1600}
                                    height={900}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center space-x-2.5', className)}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-white">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="12" x2="16" y2="16" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">DiskLens</span>
        </div>
    )
}
