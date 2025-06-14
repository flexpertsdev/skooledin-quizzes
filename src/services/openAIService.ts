
import { Worksheet } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const processWorksheetImage = async (
  file: File
): Promise<{ worksheet: Worksheet | null; error?: string }> => {
  try {
    // Show processing toast
    const toastId = toast.loading("Processing worksheet...");

    // Convert the file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Determine which endpoint to use
    const endpoint = file.type === 'application/pdf' 
      ? '/.netlify/functions/process-worksheet'  // Use Netlify function for PDFs
      : 'process-worksheet';  // Use Supabase for images

    let response;
    let data;

    if (file.type === 'application/pdf') {
      // Call Netlify function for PDFs
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: base64,
          fileType: file.type 
        })
      });
      
      data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process PDF');
      }
    } else {
      // Call Supabase Edge Function for images
      const result = await supabase.functions.invoke('process-worksheet', {
        body: { 
          image: base64,
          fileType: file.type 
        }
      });
      
      if (result.error) {
        throw result.error;
      }
      
      data = result.data;
    }

    if (!data.worksheet) {
      toast.error("Could not process worksheet", {
        id: toastId,
        description: "The worksheet format could not be recognized"
      });
      return { 
        worksheet: null,
        error: "Could not detect worksheet format" 
      };
    }

    // Success!
    toast.success("Worksheet processed successfully!", {
      id: toastId
    });

    return { worksheet: data.worksheet };
  } catch (error) {
    console.error("Error processing worksheet:", error);
    toast.error("Failed to process worksheet", {
      description: error.message
    });
    return { 
      worksheet: null, 
      error: error.message || "There was an error processing your worksheet. Please try again." 
    };
  }
};
