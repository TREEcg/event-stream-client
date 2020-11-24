const NameSpaces = require('./namespaces');

const TREE_RELATIONS = [
    NameSpaces.TREE + "Relation",
    NameSpaces.TREE + "PrefixRelation",
    NameSpaces.TREE + "SubstringRelation",
    NameSpaces.TREE + "GreaterThanRelation",
    NameSpaces.TREE + "GreaterOrEqualThanRelation",
    NameSpaces.TREE + "LessThanRelation",
    NameSpaces.TREE + "LesserThanRelation",
    NameSpaces.TREE + "LessOrEqualThanRelation",
    NameSpaces.TREE + "LesserOrEqualThanRelation",
    NameSpaces.TREE + "EqualThanRelation",
    NameSpaces.TREE + "GeospatiallyContainsRelation",
    NameSpaces.TREE + "InBetweenRelation"
];

function isTreeRelation(predicateString) {
    return TREE_RELATIONS.includes(predicateString);
}

module.exports = { isTreeRelation };