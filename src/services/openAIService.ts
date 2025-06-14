
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

    // Call our Supabase Edge Function with file type
    const { data, error } = await supabase.functions.invoke('process-worksheet', {
      body: { 
        image: base64,
        fileType: file.type 
      }
    });

    if (error) {
      toast.error("Failed to process worksheet", {
        id: toastId,
        description: error.message
      });
      throw error;
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
    return { 
      worksheet: null, 
      error: "There was an error processing your worksheet. Please try again." 
    };
  }
};
