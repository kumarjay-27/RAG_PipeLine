import { StateGraph, END } from '@langchain/langgraph'
import { GraphAnnotation } from './state'
import { supervisorAgent, routeFromSupervisor } from './supervisor'
import { ingestionAgent } from './ingestion-agent'
import { retrievalAgent } from './retrieval-agent'
import { generationAgent } from './generation-agent'

const workflow = new StateGraph(GraphAnnotation)
  .addNode('supervisor', supervisorAgent)
  .addNode('ingestion', ingestionAgent)
  .addNode('retrieval', retrievalAgent)
  .addNode('generation', generationAgent)

workflow.setEntryPoint('supervisor')

workflow.addConditionalEdges('supervisor', routeFromSupervisor, {
  ingestion: 'ingestion',
  retrieval: 'retrieval',
  generation: 'generation',
  [END]: END,
})

workflow.addEdge('ingestion', 'supervisor')
workflow.addEdge('retrieval', 'supervisor')
workflow.addEdge('generation', 'supervisor')

export const ragGraph = workflow.compile()
