import LatestPosts from '../components/LatestPosts'
import {
  About, Achievements, CompetitiveProgramming, Contact, Credentials, Hero, Marquee, Projects,
} from '../components/Sections'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Achievements />
      <CompetitiveProgramming />
      <Projects />
      <Credentials />
      <LatestPosts />
      <Contact />
    </>
  )
}
