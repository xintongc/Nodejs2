Http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });

  function generateMore() {
    while (chance.bool({ liklihood: 95 })) {
      let shouldContinue = res.write(chance.string({ length: 16 * 1024 - 1 }));
      // if (!shouldContinue) {
      //   log("Backpressure");
      //   return res.once("drain", generateMore);
      // }
    }
    res.end("\nThe end...\n", () => log("All data was sent"));
  }
  generateMore();
}).listen(8080, () => log("Listening on http://localhost:8080"));
