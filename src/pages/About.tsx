import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">About Mekelle University Course Materials Hub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Mekelle University Course Materials Hub is dedicated to facilitating access to educational resources for students and faculty. 
                Our platform connects learners with essential course materials, research documents, and educational content across all departments.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                We envision a learning environment where all students have equal access to high-quality educational materials, 
                regardless of their location or economic status. By digitizing and centralizing course resources, 
                we aim to enhance the educational experience and support academic excellence.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Comprehensive course materials across all departments</li>
                <li>Easy search and filtering capabilities</li>
                <li>Secure access for registered students and faculty</li>
                <li>Upload functionality for authorized users</li>
                <li>Regularly updated content aligned with curriculum</li>
                <li>24/7 access to educational resources</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">History</h2>
              <p className="text-muted-foreground leading-relaxed">
                Established to support the growing digital learning needs of Mekelle University, 
                the Course Materials Hub began as a student initiative to share notes and resources. 
                It has since evolved into an official university platform, serving thousands of students 
                and faculty members with essential educational materials.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about the Course Materials Hub, please contact the IT department or visit our 
                <a href="/contact" className="text-primary hover:underline"> contact page</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;