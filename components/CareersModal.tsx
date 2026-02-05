'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Briefcase, ArrowRight, UserCheck } from 'lucide-react'
import Link from 'next/link'

export function CareersModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-slate-400 hover:text-blue-400 font-jakarta transition-colors">
                    Apply to be a SimplStudios Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-950 border-slate-800 p-0 overflow-hidden text-white">
                <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
                <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="p-8 relative z-10">
                    <DialogHeader className="mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-3xl font-bold font-outfit bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Join the Mission
                        </DialogTitle>
                        <div className="text-lg text-slate-400 font-jakarta mt-2">
                            We're building the future of student-led software, and we need your help.
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                            <h3 className="font-semibold text-white font-outfit mb-1">We're Hiring!</h3>
                            <p className="text-sm text-slate-400 font-jakarta">
                                We are currently looking for passionate individuals for <strong>Communication</strong> and <strong>Marketing</strong> roles. If you love telling stories and building communities, we want to hear from you.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 group">
                                <a href="https://forms.gle/dtUu9SeW879PCrA5A" target="_blank" rel="noopener noreferrer">
                                    Apply Now
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-950 px-2 text-slate-500 font-jakarta">Team Member?</span>
                                </div>
                            </div>

                            <DialogClose asChild>
                                <Button asChild variant="outline" className="w-full border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white">
                                    <Link href="/login">
                                        <UserCheck className="mr-2 w-4 h-4" />
                                        Already an employee? Login
                                    </Link>
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
