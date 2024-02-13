import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
const TestMap = dynamic(() => import("@/components/TestMap"), { ssr: false });
const Page = () => {
  const { data: session } = useSession({ required: true });
  useEffect(() => {
    console.log("fetching");
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body:
        `data=` +
        encodeURIComponent(
          `

          [timeout:30]; 
          
          
          (
            node["addr:postcode"="80805"](48.152344345643336,11.573753356933594,48.19401425173225,11.641645431518556);
            way["addr:postcode"="80805"](48.152344345643336,11.573753356933594,48.19401425173225,11.641645431518556);
            relation["addr:postcode"="80805"](48.152344345643336,11.573753356933594,48.19401425173225,11.641645431518556);
          
            node["postal_code"="80805"](48.152344345643336,11.573753356933594,48.19401425173225,11.641645431518556);
            way["postal_code"="80805"](48.152344345643336,11.573753356933594,48.19401425173225,11.641645431518556);
            relation["postal_code"="80805"](48.152344345643336,11.573753356933594,48.19401425173225,11.641645431518556);
          );
          
          out body;
          >;
          out skel qt;`
        ),
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);
  // fetch("https://overpass-api.de/api/interpreter", {
  //   method: "POST",

  //   body:
  //     "data=" +
  //     encodeURIComponent(`
  //                 [bbox:${sw[1]},${sw[0]},${ne[1]},${ne[0]}]
  //                 [out:json]
  //                 [timeout:90]
  //                 ;
  //                 (
  //                     way
  //                         (
  //                             ${sw[1]},${sw[0]},${ne[1]},${ne[0]}
  //                          );
  //                 );
  //                 out geom;
  //             `),
  // })
  if (!session?.user) return null;
  return (
    <div>
      <TestMap />
    </div>
  );
};

export default Page;
