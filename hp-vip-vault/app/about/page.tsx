import Navbar from "@/components/navbar";
export default function AboutPage() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-12">

      <div className="max-w-2xl w-full space-y-8">

        <h1 className="text-4xl font-bold text-primary text-center">
          About HORSEPOWER.VIP
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          HORSEPOWER.VIP is a luxury-driving collective dedicated to sharing the thrill 
          of exquisite performance vehicles. We bring together hypercars, supercars, 
          and sports cars — from legendary marques to hidden gems — giving enthusiasts 
          and collectors the opportunity to experience automotive excellence 
          in a bold, refined, and community-driven setting.
        </p>

        <p className="text-lg text-muted-foreground leading-relaxed">
          Whether you’re chasing speed, crafting memories, or simply indulging your 
          passion for fine machines, HORSEPOWER.VIP exists to celebrate the beauty, 
          craftsmanship and emotion behind every engine. Our collection spans 
          a wide range of performance cars, and with every vehicle we aim to deliver 
          an unmatched driving and ownership experience.
        </p>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-card-foreground">What We Offer</h2>
          <ul className="list-disc list-inside text-card-foreground space-y-2">
            <li>Access to an exclusive curated collection of performance cars</li>
            <li>Events, drives and experiences tailored for car enthusiasts</li>
            <li>Vehicle history & data transparency via trusted APIs and records</li>
            <li>A community built around passion, respect, and automotive culture</li>
          </ul>
        </div>

        <p className="text-md text-muted-foreground italic text-center">
          “Drive the exceptional — join the passion.”  
        </p>
        <img className="w-70 mx-auto" src="HP-VIP-logo-round.png" alt="" />
      </div>

    </div>
    </>
  );
}
