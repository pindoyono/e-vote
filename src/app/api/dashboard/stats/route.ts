import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get total voters
        const totalVoters = await prisma.voter.count()

        // Get voters who have voted
        const votersWhoVoted = await prisma.voter.count({
            where: { hasVoted: true }
        })

        // Get total votes
        const totalVotes = await prisma.vote.count()

        // Get candidates with vote counts
        const candidates = await prisma.candidate.findMany({
            include: {
                _count: {
                    select: {
                        votes: true
                    }
                }
            },
            orderBy: {
                orderNumber: 'asc'
            }
        })

        // Get recent votes for activity feed
        const recentVotes = await prisma.vote.findMany({
            include: {
                voter: {
                    select: {
                        name: true,
                        studentId: true,
                        class: true
                    }
                },
                candidate: {
                    select: {
                        name: true,
                        orderNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        })

        // Calculate voting progress
        const votingProgress = totalVoters > 0 ? (votersWhoVoted / totalVoters) * 100 : 0

        return NextResponse.json({
            totalVoters,
            votersWhoVoted,
            totalVotes,
            votingProgress: Math.round(votingProgress * 100) / 100,
            candidates: candidates.map(candidate => ({
                id: candidate.id,
                name: candidate.name,
                class: candidate.class,
                orderNumber: candidate.orderNumber,
                voteCount: candidate._count.votes,
                percentage: totalVotes > 0 ? Math.round((candidate._count.votes / totalVotes) * 100 * 100) / 100 : 0
            })),
            recentVotes: recentVotes.map(vote => ({
                id: vote.id,
                voterName: vote.voter.name,
                voterClass: vote.voter.class,
                candidateName: vote.candidate.name,
                candidateNumber: vote.candidate.orderNumber,
                createdAt: vote.createdAt
            }))
        })
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        )
    }
}