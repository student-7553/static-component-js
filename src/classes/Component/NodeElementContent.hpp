

#pragma once
#include "string"
#include "unordered_map"

struct NodeElementContent
{
    std::string tag;
    std::unordered_map<string,string> attributes;
};