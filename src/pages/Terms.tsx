import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Mekelle University Course Materials Hub ("Service"), 
                you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. 
                If you do not agree with any part of these terms, you may not use this service.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mekelle University provides this platform as an educational resource for students, 
                faculty, and staff. The service offers access to course materials, research documents, 
                and other educational content. The university reserves the right to modify or discontinue 
                the service at any time without notice.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">User Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                Access to certain features of the service may require registration for an account. 
                You agree to provide accurate, current, and complete information during the registration process 
                and to update such information to keep it accurate, current, and complete. Students and faculty 
                must use their official university email addresses for account registration.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p className="text-muted-foreground leading-relaxed">
                Permission is granted to temporarily download one copy of the materials on Mekelle University's 
                Course Materials Hub for personal, non-commercial transitory viewing only. This is the grant of 
                a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Prohibited Use</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may not use the service for any purpose that is unlawful or prohibited by these terms. 
                You may not use the service in any way that could damage, disable, overburden, or impair 
                any Mekelle University server, or the network(s) connected to any Mekelle University server.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Content Ownership and Restrictions</h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials on Mekelle University's Course Materials Hub are protected by copyright and 
                other intellectual property laws. You acknowledge that all materials on this site are the 
                property of Mekelle University or its content suppliers. Some materials may be subject to 
                additional copyright restrictions imposed by faculty members or external publishers.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Mekelle University or its suppliers be liable for any damages 
                (including, without limitation, damages for loss of data or profit, or due to business 
                interruption) arising out of the use or inability to use the materials on Mekelle University's 
                site, even if Mekelle University or a Mekelle University authorized representative has been 
                notified orally or in writing of the possibility of such damage.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                This license shall automatically terminate if you violate any of these restrictions and may be 
                terminated by Mekelle University at any time. Upon terminating your viewing of these materials 
                or upon the termination of this license, you must destroy any downloaded materials in your 
                possession whether in electronic or printed format.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of Ethiopia 
                and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact Mekelle University 
                through our <a href="/contact" className="text-primary hover:underline">contact page</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;