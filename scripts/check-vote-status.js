const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVoteStatus() {
    try {
        console.log('🔍 Checking Vote System Status...\n')

        // Check voting session
        const votingSession = await prisma.votingSession.findFirst({
            where: { isActive: true }
        })
        
        console.log('📊 Voting Session:')
        if (votingSession) {
            console.log('  ✅ Status: ACTIVE')
            console.log(`  📅 Started: ${votingSession.startDate}`)
            console.log(`  📅 Ends: ${votingSession.endDate}`)
        } else {
            console.log('  ❌ Status: INACTIVE - No active voting session!')
        }
        
        // Check verified voters
        const verifiedCount = await prisma.voter.count({
            where: { isVerified: true }
        })
        
        const totalVoters = await prisma.voter.count()
        
        console.log(`\n📊 Voters Status:`)
        console.log(`  ✅ Verified: ${verifiedCount}/${totalVoters}`)
        console.log(`  ❌ Not verified: ${totalVoters - verifiedCount}`)
        
        // Sample token
        const sampleVoter = await prisma.voter.findFirst({
            where: { isVerified: true },
            select: { name: true, voteToken: true, hasVoted: true }
        })
        
        if (sampleVoter) {
            console.log(`\n📝 Sample Verified Voter:`)
            console.log(`  Name: ${sampleVoter.name}`)
            console.log(`  Token: ${sampleVoter.voteToken}`)
            console.log(`  Has Voted: ${sampleVoter.hasVoted ? 'Yes' : 'No'}`)
            console.log(`  🔗 Vote URL: http://localhost:3000/vote/${sampleVoter.voteToken}`)
        } else {
            console.log('\n❌ No verified voters found!')
        }
        
        // Check candidates
        const candidateCount = await prisma.candidate.count()
        console.log(`\n📊 Candidates: ${candidateCount} candidates available`)
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

checkVoteStatus()
