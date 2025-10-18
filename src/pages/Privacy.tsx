import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mekelle University Course Materials Hub collects the following information from its users:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Account information: When you register for an account, we collect your name, email address, department, and student/employee ID</li>
                <li>Usage data: We collect information on how the service is accessed and used, including IP address, browser type, and pages visited</li>
                <li>Uploaded content: Materials uploaded to the platform are stored and processed according to our content guidelines</li>
                <li>Communications: If you contact us directly, we may receive additional information about you</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent, and address technical issues</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only as long as necessary for the purposes set out in this privacy policy. 
                We retain usage data for internal analysis purposes. Usage data is generally retained for a shorter period, 
                except when this data is used to strengthen the security or to improve the functionality of our service.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                The security of your data is important to us, but remember that no method of transmission over the Internet 
                or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
                your personal information, we cannot guarantee its absolute security.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not share your personal information with third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>With your consent</li>
                <li>For legal compliance: To comply with a legal obligation, to respond to a valid legal request</li>
                <li>To protect university interests: To protect the rights, property, or safety of the university, our users, or others</li>
                <li>With service providers: We may share your information with trusted third-party service providers who assist us in operating the platform</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Data Protection Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>The right to access: You have the right to request copies of your personal data</li>
                <li>The right to rectification: You have the right to request that we correct any information you believe is inaccurate or incomplete</li>
                <li>The right to erasure: You have the right to request that we erase your personal data</li>
                <li>The right to restrict processing: You have the right to request that we restrict the processing of your personal data</li>
                <li>The right to data portability: You have the right to request that we transfer the data we have collected to another organization</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use cookies and similar tracking technologies to track activity on our service and store certain information. 
                You can direct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Educational Records</h2>
              <p className="text-muted-foreground leading-relaxed">
                As an educational institution, some of your information may be considered educational records under applicable educational 
                privacy laws. We handle such records in accordance with Ethiopian educational privacy regulations and university policies.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy 
                on this page and updating the "Last updated" date. You are advised to review this privacy policy periodically for any 
                changes. Changes to this privacy policy are effective when they are posted on this page.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this privacy policy, please contact us through our 
                <a href="/contact" className="text-primary hover:underline"> contact page</a> or at privacy@mekelleuniversity.edu.et.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;