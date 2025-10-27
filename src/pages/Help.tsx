import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          {/* <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Help Center</CardTitle>
          </CardHeader> */}
          <CardContent>
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
                
                <Accordion type="single" collapsible className="w-full space-y-4">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I access course materials?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        To access course materials, you need to create an account and log in. Once logged in, 
                        you can browse materials by department or use the search function to find specific resources. 
                        Materials are organized by department and course code for easy navigation.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Who can upload materials?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Currently, only authorized faculty members and administrators can upload materials to ensure 
                        quality and accuracy. If you have course materials to contribute, please contact your department head 
                        who can coordinate with the system administrators.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I request access to restricted materials?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Some materials may be restricted to specific courses or user roles. If you believe you should have 
                        access to certain materials, please contact your course instructor or the department administrator. 
                        They can verify your enrollment and grant appropriate access.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What file formats are supported?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        We support common document formats including PDF, DOC, DOCX, PPT, PPTX, and video formats like MP4. 
                        Please ensure that the files you upload comply with the university's intellectual property and 
                        academic integrity policies.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I report an issue with content?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        If you encounter any inappropriate content, broken links, or technical issues, please use 
                        the reporting feature available on each material card. Alternatively, you can contact our 
                        support team through the <a href="/contact" className="text-primary hover:underline">contact page</a>.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>How do I update my profile information?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        To update your profile information, navigate to the "Profile" section after logging in. 
                        From there, you can update your personal information and preferences. Some fields may be 
                        linked to the university's official records and may require administrative approval to change.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
              
              <section className="border-t pt-8">
                <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                  <li>Create an account using your university email address</li>
                  <li>Verify your account through the confirmation email</li>
                  <li>Browse materials by department or use the search function</li>
                  <li>Download or view materials as needed for your studies</li>
                  <li>Log out when finished, especially on shared computers</li>
                </ol>
              </section>
              
              <section className="border-t pt-8">
                <h2 className="text-2xl font-semibold mb-4">Technical Support</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    If you're experiencing technical difficulties with the platform, please try these steps:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Clear your browser cache and cookies</li>
                    <li>Try a different web browser</li>
                    <li>Ensure you have a stable internet connection</li>
                    <li>Disable browser extensions that might interfere</li>
                    <li>Update your browser to the latest version</li>
                  </ul>
                  <p className="pt-2">
                    If issues persist, contact our technical support team through the 
                    <a href="/contact" className="text-primary hover:underline"> contact page</a>.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;