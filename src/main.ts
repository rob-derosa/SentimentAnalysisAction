import * as pii from "./sentiment-analyzer";
import * as core from "@actions/core";
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const subKey = core.getInput("azure-cognitive-subscription-key", { required: true })
    const url = core.getInput("azure-cognitive-endpoint", { required: true })
    const textToAnalyze = core.getInput("text-to-analyze", { required: true })
    const textLanguage = core.getInput("text-language", { required: true })

    console.log(github.context.payload);

    if (!subKey)
      throw new Error('No Azure Cognitive Service subscription key defined');

    if (!url)
      throw new Error('No Azure Cognitive Service endpoint defined');

    if (!textToAnalyze)
      throw new Error('No text passed in to analyze');

    const response = await pii.callSentimentAnalysisEndpoint(textToAnalyze, textLanguage, url, subKey)

    if (response && response.documents.length >= 1) {
      console.log("\n\n------------------------------------------------------");
      console.log(textToAnalyze);
      console.log(JSON.stringify(response));
      console.log("------------------------------------------------------\n\n");

      core.setOutput("positive", response.documents[0].documentScores.positive);
      core.setOutput("neutral", response.documents[0].documentScores.neutral);
      core.setOutput("negative", response.documents[0].documentScores.negative);
      core.setOutput("results", JSON.stringify(response));
    }
    else{
      console.log("There was no response from the Sentiment Analysis endpoint");
    }

    core.setOutput("results", JSON.stringify(response));
  } catch (error) {
    console.log(error);
    core.setFailed(error.message)
  }
}

run()