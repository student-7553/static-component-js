

#pragma once
#include "string"
#include "vector"
#include "variant"
#include "NodeElementContent.hpp"


struct NodeStringContent
{
    string text;
};

enum NodeType
{
    STRING,
    ELEMENT
};

struct Node
{
    NodeType nodeType;
    std::variant<NodeElementContent, NodeStringContent> acontent;
    std::vector<Node>
        childrens;
};
