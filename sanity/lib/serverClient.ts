import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Server-only Sanity client with write access. NEVER import this into a client
// component - the "server-only" guard above will throw at build time if you do.
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
