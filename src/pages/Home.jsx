import LatestPosts from '../components/LatestPosts'
import {
  About, Achievements, CompetitiveProgramming, Contact, Credentials, Hero, Marquee, Projects, Research,
} from '../components/Sections'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Achievements />
      <Research />
      <CompetitiveProgramming />
      <Projects />
      <Credentials />
      <LatestPosts />
      <Contact />
    </>
  )
}
