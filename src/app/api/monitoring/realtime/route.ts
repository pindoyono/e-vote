import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get basic stats
        const totalVoters = await prisma.voter.count()
        const verifiedVoters = await prisma.voter.count({
            where: { isVerified: true }
        })
        const totalVotes = await prisma.vote.count()

        // Calculate participation rate
        const participationRate = verifiedVoters > 0 ? (totalVotes / verifiedVoters) * 100 : 0

        // Get candidates with vote counts
        const candidates = await prisma.candidate.findMany({
            orderBy: { orderNumber: 'asc' },
            include: {
                _count: {
                    select: { votes: true }
                }
            }
        })

        const candidatesWithStats = candidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            class: candidate.class,
            orderNumber: candidate.orderNumber,
            voteCount: candidate._count.votes,
            percentage: totalVotes > 0 ? (candidate._count.votes / totalVotes) * 100 : 0
        }))

        // Get recent votes (last 10)
        const recentVotes = await prisma.vote.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                candidate: true,
                voter: true
            }
        })

        const recentVotesFormatted = recentVotes.map(vote => ({
            id: vote.id,
            candidateName: vote.candidate.name,
            timestamp: vote.createdAt.toISOString(),
            voterClass: vote.voter.class
        }))

        // Get hourly data for the last 24 hours
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

        const hourlyVotes = await prisma.vote.findMany({
            where: {
                createdAt: {
                    gte: twentyFourHoursAgo
                }
            },
            select: {
                createdAt: true
            }
        })

        // Group votes by hour
        const hourlyData: { [key: string]: number } = {}
        const now = new Date()

        // Initialize all hours with 0
        for (let i = 23; i >= 0; i--) {
            const hour = new Date(now)
            hour.setHours(hour.getHours() - i, 0, 0, 0)
            const hourKey = hour.getHours().toString().padStart(2, '0') + ':00'
            hourlyData[hourKey] = 0
        }

        // Count votes per hour
        hourlyVotes.forEach(vote => {
            const hour = vote.createdAt.getHours().toString().padStart(2, '0') + ':00'
            hourlyData[hour] = (hourlyData[hour] || 0) + 1
        })

        const hourlyDataArray = Object.entries(hourlyData).map(([hour, votes]) => ({
            hour,
            votes
        }))

        const realtimeStats = {
            totalVoters,
            verifiedVoters,
            totalVotes,
            participationRate,
            candidates: candidatesWithStats,
            recentVotes: recentVotesFormatted,
            hourlyData: hourlyDataArray
        }

        return NextResponse.json(realtimeStats)
    } catch (error) {
        console.error('Realtime monitoring API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}