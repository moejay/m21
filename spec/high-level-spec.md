
# Global thoughts 

All nodes are files, mostly okf 
there can be linked artifacts of any kind though

For now global skill with resources for each step defining things like 

* Best practices
* Types of question to ask in interview 
* Information needed 

All the stages can be generated and chatted with to refine them, user can reference node or parts of node to the agent 


# The business part 


Need at least one of each type, even if the contents of it are non existent


Frontmatter schema 

```yaml

category: 'business'
type: enum[mission|vision|problem|persona|outcome|regulation|constraint]
title: string
description: string

```

How to visualize:

* Simple expandable cards , showing linked product category cards as summary


# Product/Business Solution

The business solution capabilities should be tied/related to business problem

Frontmatter Schema 

```yaml

category: 'solution'
type: enum[capability]
title: string
description: string

```

How to visualize:

* Simple expandable cards


# Visual Design 

Visual language , design components, can even generate a css ( which can be used to theme m21 )

```yaml
category: 'visual-design'
```

How to visualize:

* Cards describing visual language, feel

# System Design

This is the conceptual design of the system and their components, one or more components maybe tied to one or more product capabilities 

The system design should just be describing how the different components interact and relate to each other , what data they provide or manage 

Frontmatter Schema

```yaml

category: 'system-design'
type: enum[data|service|background-jobs]
external_depenency: boolean # this means if the component is external dependency or not, such as 3rd party service 

```

How to visualize:

* Graph of the different components, clicking on them reveals details


# System Architecture

This is the step that takes the system design and materializes it in a clear architecture with clear boundaries
and communication patterns between the subsystems, how do they interface, API , event based, hybrid.

Common data models such as events maybe ( Maybe that's not a thing at this level and is sufficiently defined at the applicaiton level )


Frontmatter Schema

```yaml
category: 'system-architecture'
```



# Application Architecture

For each of the applications regardless of dependency ( for example a managed service or a database )

## Common

Common frontmatter for apps 

```yaml

app-id: app-name

```

## Application Architecture 

How the application itself is structured, how it's structured (layered, ), what modules exist

```yaml
category: 'app-architecture'
component: string example middleware
description: string
```

How to visualize: 

* Graph for components
* card descriptions for non components 

## Code Design 

* Models, Interfaces, Contrtacts, Patterns, Errors, Observability, 

## Implementation 

* M21 will provide gherkin features 
* Tests must run on the exact gherkin features
* Results can be read by m21 to display status 

## deployment

* How the application is deployed 
* Secrets and where are they stored,



## Where does Infra sit ? 

Maybe top level infra in addiotoin to deployment 


### Critique and stress testing the model 


This is to refine the spec / model above :


* How would it look like for an app with multiple  designs
* Serverless ? where does that fit ? deployment or architecture level 
