import LatestPosts from '../components/LatestPosts'
import { About, Achievements, Contact, Credentials, Hero, Marquee, Projects } from '../components/Sections'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Achievements />
      <Credentials />
      <Projects />
      <LatestPosts />
      <Contact />
    </>
  )
}
