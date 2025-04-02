import axios, { AxiosRequestConfig } from "axios";

export interface returnDataType {
  success: boolean;
  data?: object | null;
}

export default async function serverApi({
  url,
  method = "GET",
  data,
  params,
  auth,
}: {
  url: string;
  method: string;
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  auth?: AxiosRequestConfig["auth"];
}) {
  const baseURL = process.env.API_URL;

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    data: method === "POST" ? data : null,
    baseURL,
    url,
    method,
    params,
    auth,
  };

  console.log("request config ->", config);

  try {
    const response = await axios(config);

    return response.data;
  } catch (error) {
    console.error("erro axios", error);
  }
}
