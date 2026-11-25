#pragma once
#include "../FileLoader/FileLoader.hpp"
#include "Node.hpp"
#include "string"
#include "vector"

class Component
{

public:
    Component();
    void init(const ComponentFile file);

private:
    Node rootNode;
};